import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import Stripe from 'stripe'

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || secretKey.includes('placeholder')) {
    throw new Error('Stripe is not configured. Please add a valid STRIPE_SECRET_KEY.')
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover'
  })
}

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

    // Check if booking is in correct status
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Booking cannot be paid' },
        { status: 400 }
      )
    }

    // Create Stripe PaymentIntent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      customer: undefined, // You can create/get Stripe customer here
      metadata: {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        guestId: booking.guestId,
        hostId: booking.hostId
      },
      description: `Booking for ${booking.property.title}`,
      automatic_payment_methods: {
        enabled: true
      }
    })

    // Create payment record
    await (prisma as any).payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: 'PENDING',
        method: 'credit_card',
        stripePaymentId: paymentIntent.id
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalAmount,
      currency: booking.currency
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}