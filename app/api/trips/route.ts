import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'

type BookingItem = {
  id: string
  propertyId: string
  propertyTitle: string
  propertyPhotos: string[]
  propertyAddress: string
  propertyCity: string
  propertyCountry: string
  checkIn: string
  checkOut: string
  numberOfNights: number
  guests: number
  adults: number
  children: number
  infants: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  specialRequests?: string
  confirmedAt?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  createdAt: string
}

type TripsSummary = {
  upcomingCount: number
  pastCount: number
  activeCount: number
  totalSpent: number
}

type TripsResponse = {
  summary: TripsSummary
  upcoming: BookingItem[]
  past: BookingItem[]
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const now = new Date()

    // Fetch all user bookings with property details
    const [upcomingBookings, pastBookings] = await Promise.all([
      // Upcoming trips: checkIn >= today, status is CONFIRMED or PENDING
      prisma.booking.findMany({
        where: {
          guestId: user.userId,
          checkIn: { gte: now },
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              photos: true,
              address: true,
              city: true,
              state: true,
              country: true
            }
          }
        },
        orderBy: { checkIn: 'asc' }
      }),
      // Past trips: checkOut < today OR status is COMPLETED/CANCELLED
      prisma.booking.findMany({
        where: {
          guestId: user.userId,
          OR: [
            { checkOut: { lt: now } },
            { status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED'] } }
          ]
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              photos: true,
              address: true,
              city: true,
              state: true,
              country: true
            }
          }
        },
        orderBy: { checkOut: 'desc' },
        take: 50 // Limit past bookings
      })
    ])

    // Transform bookings to response format
    const formatBooking = (booking: any): BookingItem => {
      const property = booking.property || {}
      const photos = Array.isArray(property.photos) ? property.photos : []
      const photoUrls = photos.map((p: any) => (typeof p === 'string' ? p : p?.url || ''))

      return {
        id: booking.id,
        propertyId: booking.propertyId,
        propertyTitle: property.title || 'Property',
        propertyPhotos: photoUrls,
        propertyAddress: property.address || '',
        propertyCity: property.city || '',
        propertyCountry: property.country || '',
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        numberOfNights: booking.numberOfNights,
        guests: booking.guests,
        adults: booking.adults,
        children: booking.children || 0,
        infants: booking.infants || 0,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        specialRequests: booking.specialRequests || undefined,
        confirmedAt: booking.confirmedAt?.toISOString(),
        cancelledAt: booking.cancelledAt?.toISOString(),
        cancelledBy: booking.cancelledBy || undefined,
        cancellationReason: booking.cancellationReason || undefined,
        createdAt: booking.createdAt.toISOString()
      }
    }

    const upcoming = upcomingBookings.map(formatBooking)
    const past = pastBookings.map(formatBooking)

    // Calculate summary
    const activeCount = upcoming.filter(b => b.status === 'CONFIRMED').length
    const totalSpent = [...upcoming, ...past]
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    const summary: TripsSummary = {
      upcomingCount: upcoming.length,
      pastCount: past.length,
      activeCount,
      totalSpent
    }

    const response: TripsResponse = {
      summary,
      upcoming,
      past
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
