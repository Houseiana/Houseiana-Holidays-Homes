import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth-server'
import { createStripePaymentIntent } from '@/lib/stripe-config'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
            owner: true,
          },
        },
        guest: true,
      },
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
        { error: 'Unauthorized to pay for this booking' },
        { status: 403 }
      )
    }

    // Check if booking can be paid
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      )
    }

    // Check if booking is in correct status
    if (!['AWAITING_PAYMENT', 'PENDING', 'REQUESTED', 'APPROVED'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking cannot be paid. Current status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent(
      booking.totalPrice,
      booking.currency || 'USD',
      {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        guestId: booking.guestId,
        hostId: booking.hostId,
      }
    )

    // Create payment record in database
    await (prisma as any).payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency || 'USD',
        status: 'PENDING',
        method: 'stripe',
        stripePaymentId: paymentIntent.id,
      },
    })

    console.log('✅ Stripe payment intent created:', {
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalPrice,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalPrice,
      currency: booking.currency || 'USD',
    })
  } catch (error: any) {
    console.error('❌ Error creating Stripe payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
