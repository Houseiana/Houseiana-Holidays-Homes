import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createSadadPayment, generateMerchantReference, validateSadadConfig } from '@/lib/sadad'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            host: true
          }
        },
        guest: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user owns this booking
    if (booking.guestId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if booking is in correct status (allow REQUESTED, APPROVED, or legacy PENDING)
    if (!['REQUESTED', 'APPROVED', 'PENDING'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking cannot be paid - current status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Check if hold has expired
    if (booking.holdExpiresAt && new Date(booking.holdExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Booking hold has expired' },
        { status: 400 }
      )
    }

    // Check if payment is already pending or completed
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      )
    }

    // Validate Sadad configuration
    validateSadadConfig()

    // Prepare payment data
    const amount = booking.totalPrice || booking.totalAmount || 0
    const merchantReference = generateMerchantReference(booking.id)
    const customerName = `${booking.guest.firstName} ${booking.guest.lastName}`

    // Extract phone number and country code from guest
    const customerPhone = booking.guest.phone || booking.guest.cellnumber || undefined
    const customerCountryCode = booking.guest.countryCode?.replace('+', '') || '974' // Default to Qatar

    // Create Sadad payment transaction (invoice-based)
    const sadadPayment = await createSadadPayment({
      amount,
      customerName,
      customerPhone,
      customerCountryCode,
      description: `Booking for ${booking.property.title}`,
      metadata: {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        guestId: booking.guestId,
        hostId: booking.hostId,
        merchantReference,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString()
      }
    })

    // Update booking with Sadad invoice number and merchant reference
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: sadadPayment.invoiceNumber, // Store Sadad invoice number
        transactionId: merchantReference
      }
    })

    return NextResponse.json({
      transactionId: sadadPayment.invoiceNumber, // Return invoice number as transaction ID
      paymentUrl: sadadPayment.paymentUrl, // https://sadad.qa/invoice/{invoiceNumber}
      merchantReference: merchantReference,
      amount: sadadPayment.amount,
      currency: 'QAR', // Sadad Qatar uses QAR
      status: sadadPayment.status
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}