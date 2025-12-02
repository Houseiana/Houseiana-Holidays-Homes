import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma-server'

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = { userId }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'guest' // 'guest' or 'host'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    if (role === 'host') {
      where.hostId = user.userId
    } else {
      where.guestId = user.userId
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    const bookings = await (prisma as any).booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            country: true,
            photos: true,
            coverPhoto: true
          }
        },
        ...(role === 'host' && {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        })
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalCount = await (prisma as any).booking.count({ where })

    // Transform to match dashboard expectations (with host console fields)
    const items = bookings.map((booking: any) => {
      const property = booking.property || {}
      const photos = Array.isArray(property.photos) ? property.photos : []
      const coverPhoto = property.coverPhoto || (photos.length > 0 ? photos[0] : null)

      // Guest details for host console
      const guest = booking.guest || {}
      const guestName = guest.firstName && guest.lastName
        ? `${guest.firstName} ${guest.lastName}`
        : guest.firstName || guest.email || 'Guest'
      const guestInitials = guest.firstName && guest.lastName
        ? `${guest.firstName[0]}${guest.lastName[0]}`.toUpperCase()
        : guestName[0]?.toUpperCase() || 'G'

      return {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        checkIn: booking.checkIn?.toISOString?.() || booking.checkIn,
        checkOut: booking.checkOut?.toISOString?.() || booking.checkOut,
        numberOfNights: booking.numberOfNights || 0,
        amount: booking.totalPrice || 0,
        totalPrice: booking.totalPrice || 0,
        subtotal: booking.subtotal || 0,
        serviceFee: booking.serviceFee || 0,
        cleaningFee: booking.cleaningFee || 0,
        taxAmount: booking.taxAmount || 0,
        guests: booking.guests || 1,
        hostId: booking.hostId,
        holdExpiresAt: booking.holdExpiresAt?.toISOString?.() || null,
        approvedAt: booking.approvedAt?.toISOString?.() || null,
        confirmedAt: booking.confirmedAt?.toISOString?.() || null,
        cancelledAt: booking.cancelledAt?.toISOString?.() || null,
        cancellationPolicyType: booking.cancellationPolicyType,
        refundAmount: booking.refundAmount || null,
        // Guest info (for host console)
        ...(role === 'host' && {
          guestName,
          guestPhone: guest.phone || null,
          guestInitials,
          guestEmail: guest.email,
          propertyName: property.title || 'Property',
        }),
        property: {
          title: property.title || 'Property',
          address: property.address || `${property.city || ''}, ${property.country || ''}`.trim(),
          city: property.city,
          country: property.country,
          coverPhoto,
          photos
        }
      }
    })

    return NextResponse.json({
      items,
      bookings: items, // Keep both for backwards compatibility
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create new booking with concurrency control
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = { userId }

    const bookingData = await request.json()

    // Validate required fields
    const requiredFields = ['propertyId', 'checkIn', 'checkOut', 'guests', 'adults']
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      adults,
      children = 0,
      infants = 0,
      specialRequests
    } = bookingData

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    if (checkInDate < new Date()) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    // Get property with pricing
    const property = await (prisma as any).property.findUnique({
      where: { id: propertyId },
      include: {
        host: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Property is not available for booking' },
        { status: 400 }
      )
    }

    if (guests > property.maxGuests) {
      return NextResponse.json(
        { error: `Property can accommodate maximum ${property.maxGuests} guests` },
        { status: 400 }
      )
    }

    // Prevent host from booking their own property
    if (property.hostId === user.userId) {
      return NextResponse.json(
        { error: 'You cannot book your own property' },
        { status: 400 }
      )
    }

    // Use transaction for concurrency control
    const booking = await (prisma as any).$transaction(async (prismaTransaction: any) => {
      // Check for conflicting bookings (include AWAITING_PAYMENT but with lazy expiration)
      const potentialConflicts = await (prismaTransaction as any).booking.findMany({
        where: {
          propertyId,
          status: { in: ['AWAITING_PAYMENT', 'REQUESTED', 'CONFIRMED', 'CHECKED_IN'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } }
              ]
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } }
              ]
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } }
              ]
            }
          ]
        }
      })

      // Lazy Expiration: Check if AWAITING_PAYMENT bookings have expired
      const now = new Date()
      const expiredBookingIds: string[] = []
      const validConflicts = potentialConflicts.filter((booking: any) => {
        if (booking.status === 'AWAITING_PAYMENT' && booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= now) {
          expiredBookingIds.push(booking.id)
          return false // This booking has expired, not a real conflict
        }
        return true // Valid conflict
      })

      // Update expired bookings to EXPIRED status
      if (expiredBookingIds.length > 0) {
        await (prismaTransaction as any).booking.updateMany({
          where: { id: { in: expiredBookingIds } },
          data: { status: 'EXPIRED' }
        })
      }

      if (validConflicts.length > 0) {
        throw new Error('Property is not available for selected dates')
      }

      // Check availability calendar
      const unavailableDates = await (prismaTransaction as any).availability.findMany({
        where: {
          propertyId,
          date: {
            gte: checkInDate,
            lt: checkOutDate
          },
          available: false
        }
      })

      if (unavailableDates.length > 0) {
        throw new Error('Property is not available for selected dates')
      }

      // Calculate pricing
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      const nightlyRate = property.pricePerNight || property.basePrice || 0
      const subtotal = nights * nightlyRate
      const cleaningFee = property.cleaningFee || 0
      const serviceFee = subtotal * 0.1 // 10% service fee
      const taxAmount = (subtotal + serviceFee) * 0.12 // 12% taxes
      const totalPrice = subtotal + cleaningFee + serviceFee + taxAmount

      // Calculate platform commission (e.g., 15% of subtotal)
      const platformCommission = subtotal * 0.15
      const hostEarnings = subtotal - platformCommission

      // Determine booking flow: instant book or request-to-book
      const isInstantBook = property.instantBook && !property.requestToBook
      const initialStatus = isInstantBook ? 'AWAITING_PAYMENT' : 'REQUESTED'

      // Set hold expiry (24 hours for request-to-book, 15 minutes for instant book)
      const holdExpiryMinutes = property.requestToBook ? (property.approvalWindowHours || 24) * 60 : 15
      const holdExpiresAt = new Date(Date.now() + holdExpiryMinutes * 60 * 1000)

      // Get cancellation policy from property
      const cancellationPolicy = property.cancellationPolicy || 'FLEXIBLE'

      // Calculate cancellation deadline based on policy
      let cancellationDeadline = new Date(checkInDate)
      switch (cancellationPolicy) {
        case 'FLEXIBLE':
          cancellationDeadline.setDate(cancellationDeadline.getDate() - 1) // 24h before
          break
        case 'MODERATE':
          cancellationDeadline.setDate(cancellationDeadline.getDate() - 5) // 5 days before
          break
        case 'STRICT':
          cancellationDeadline.setDate(cancellationDeadline.getDate() - 14) // 14 days before
          break
        case 'SUPER_STRICT':
          cancellationDeadline.setDate(cancellationDeadline.getDate() - 30) // 30 days before
          break
      }

      // Create booking
      const newBooking = await (prismaTransaction as any).booking.create({
        data: {
          guestId: user.userId,
          propertyId,
          hostId: property.hostId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          numberOfNights: nights,
          guests,
          adults,
          children,
          infants,
          nightlyRate,
          subtotal,
          cleaningFee,
          serviceFee,
          taxAmount,
          totalPrice,
          platformCommission,
          hostEarnings,
          specialRequests,
          status: initialStatus,
          paymentStatus: 'PENDING',
          holdExpiresAt,
          cancellationPolicyType: cancellationPolicy,
          cancellationDeadline
        },
        include: {
          property: {
            include: {
              photos: {
                where: { isMain: true },
                take: 1
              }
            }
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      // Block availability dates (mark as unavailable)
      const datesToBlock = []
      for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
        datesToBlock.push(new Date(d))
      }

      await (prismaTransaction as any).availability.updateMany({
        where: {
          propertyId,
          date: { in: datesToBlock }
        },
        data: {
          available: false
        }
      })

      return newBooking
    })

    return NextResponse.json(booking, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)

    if (error instanceof Error && error.message.includes('not available')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}