import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  const bookingId = paymentIntent.metadata?.bookingId

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata')
    return
  }

  try {
    // Update booking to CONFIRMED status with PAID payment status
    const booking = await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentIntentId: paymentIntent.id,
        paymentCapturedAt: new Date(),
        confirmedAt: new Date(),
        holdExpiresAt: null // Clear hold expiry since payment is confirmed
      },
      include: {
        property: true,
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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

    console.log("Booking", bookingId, "confirmed - payment successful")

    // TODO: Send confirmation email/notification to guest and host
    // TODO: Add to audit log

  } catch (error) {
    console.error('Error updating booking after payment success:', error)
    throw error
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)

  const bookingId = paymentIntent.metadata?.bookingId

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata')
    return
  }

  try {
    // Update booking payment status to FAILED
    // Keep the booking in REQUESTED/APPROVED status to allow retry
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'FAILED'
      }
    })

    console.log("Booking", bookingId, "payment failed - status updated")

    // TODO: Send notification to guest about payment failure

  } catch (error) {
    console.error('Error updating booking after payment failure:', error)
    throw error
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id)

  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) {
    console.error('No payment intent ID in charge')
    return
  }

  try {
    // Find booking by payment intent ID
    const booking = await (prisma as any).booking.findFirst({
      where: { paymentIntentId }
    })

    if (!booking) {
      console.error("No booking found for payment intent", paymentIntentId)
      return
    }

    // Calculate refund amount
    const refundAmount = charge.amount_refunded / 100 // Convert from cents

    // Update booking with refund information
    await (prisma as any).booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: charge.amount_refunded === charge.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount,
        refundedAt: new Date(),
        refundReason: 'Stripe refund processed'
      }
    })

    console.log("Booking", booking.id, "refunded:", refundAmount)

    // TODO: Send refund confirmation to guest

  } catch (error) {
    console.error('Error updating booking after refund:', error)
    throw error
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent canceled:', paymentIntent.id)

  const bookingId = paymentIntent.metadata?.bookingId

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata')
    return
  }

  try {
    // Find the booking
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      console.error("Booking", bookingId, "not found")
      return
    }

    // If booking is not yet confirmed, we can mark it as expired
    if (['REQUESTED', 'APPROVED', 'PENDING'].includes(booking.status)) {
      await (prisma as any).booking.update({
        where: { id: bookingId },
        data: {
          status: 'EXPIRED',
          paymentStatus: 'FAILED'
        }
      })

      console.log("Booking", bookingId, "marked as expired due to canceled payment")

      // TODO: Release availability holds
      // TODO: Send notification
    }

  } catch (error) {
    console.error('Error handling canceled payment intent:', error)
    throw error
  }
}
