import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!STRIPE_CONFIG.webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
        break

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.bookingId

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata')
    return
  }

  try {
    // Update booking payment status
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    })

    // Create transaction record
    await (prisma as any).transaction.create({
      data: {
        userId: paymentIntent.metadata.guestId,
        bookingId,
        description: `Payment for booking ${bookingId}`,
        amount: paymentIntent.amount / 100,
        status: 'PAID',
        type: 'PAYMENT',
        paymentMethod: 'Credit Card',
        stripeChargeId: paymentIntent.latest_charge as string,
        date: new Date()
      }
    })

    console.log(`Booking ${bookingId} marked as PAID`)
  } catch (error) {
    console.error('Error updating booking:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.bookingId

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata')
    return
  }

  try {
    // Update booking payment status
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'FAILED'
      }
    })

    // Create failed transaction record
    await (prisma as any).transaction.create({
      data: {
        userId: paymentIntent.metadata.guestId,
        bookingId,
        description: `Failed payment for booking ${bookingId}`,
        amount: paymentIntent.amount / 100,
        status: 'FAILED',
        type: 'PAYMENT',
        paymentMethod: 'Credit Card',
        stripeChargeId: paymentIntent.latest_charge as string || null,
        date: new Date()
      }
    })

    console.log(`Booking ${bookingId} marked as FAILED`)
  } catch (error) {
    console.error('Error updating failed payment:', error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment canceled:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.bookingId

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata')
    return
  }

  try {
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'CANCELED',
        status: 'CANCELED'
      }
    })

    console.log(`Booking ${bookingId} marked as CANCELED`)
  } catch (error) {
    console.error('Error canceling booking:', error)
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id)

  try {
    // Find the original transaction
    const transaction = await (prisma as any).transaction.findFirst({
      where: { stripeChargeId: charge.id }
    })

    if (!transaction) {
      console.error('Original transaction not found for charge:', charge.id)
      return
    }

    // Update booking payment status
    if (transaction.bookingId) {
      await (prisma as any).booking.update({
        where: { id: transaction.bookingId },
        data: {
          paymentStatus: 'REFUNDED'
        }
      })
    }

    // Create refund transaction
    await (prisma as any).transaction.create({
      data: {
        userId: transaction.userId,
        bookingId: transaction.bookingId,
        description: `Refund for booking ${transaction.bookingId}`,
        amount: charge.amount_refunded / 100,
        status: 'REFUNDED',
        type: 'REFUND',
        paymentMethod: transaction.paymentMethod,
        stripeChargeId: charge.id,
        date: new Date()
      }
    })

    console.log(`Refund processed for charge ${charge.id}`)
  } catch (error) {
    console.error('Error processing refund:', error)
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Payment method attached:', paymentMethod.id)

  if (!paymentMethod.customer || typeof paymentMethod.customer !== 'string') {
    console.error('No customer associated with payment method')
    return
  }

  try {
    // Find user by Stripe customer ID
    const user = await (prisma as any).user.findFirst({
      where: { stripeCustomerId: paymentMethod.customer }
    })

    if (!user) {
      console.error('User not found for Stripe customer:', paymentMethod.customer)
      return
    }

    // Check if payment method already exists
    const existing = await (prisma as any).paymentMethod.findFirst({
      where: { stripePaymentMethodId: paymentMethod.id }
    })

    if (existing) {
      console.log('Payment method already exists')
      return
    }

    // Get customer to check default payment method
    const customer = await stripe.customers.retrieve(paymentMethod.customer)
    const isDefault =
      typeof customer !== 'deleted' &&
      customer.invoice_settings?.default_payment_method === paymentMethod.id

    // If this is the default method, unset others
    if (isDefault) {
      await (prisma as any).paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      })
    }

    // Create payment method record
    await (prisma as any).paymentMethod.create({
      data: {
        userId: user.id,
        brand: paymentMethod.card?.brand || 'unknown',
        last4: paymentMethod.card?.last4 || '0000',
        expiry: paymentMethod.card
          ? `${String(paymentMethod.card.exp_month).padStart(2, '0')}/${paymentMethod.card.exp_year}`
          : '00/0000',
        isDefault,
        stripePaymentMethodId: paymentMethod.id
      }
    })

    console.log('Payment method saved to database')
  } catch (error) {
    console.error('Error saving payment method:', error)
  }
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Payment method detached:', paymentMethod.id)

  try {
    await (prisma as any).paymentMethod.deleteMany({
      where: { stripePaymentMethodId: paymentMethod.id }
    })

    console.log('Payment method removed from database')
  } catch (error) {
    console.error('Error removing payment method:', error)
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Customer updated:', customer.id)

  try {
    // Update default payment method if changed
    const user = await (prisma as any).user.findFirst({
      where: { stripeCustomerId: customer.id }
    })

    if (!user) {
      console.error('User not found for customer:', customer.id)
      return
    }

    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method

    if (defaultPaymentMethodId) {
      // Unset all default flags
      await (prisma as any).paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      })

      // Set new default
      await (prisma as any).paymentMethod.updateMany({
        where: {
          userId: user.id,
          stripePaymentMethodId: defaultPaymentMethodId
        },
        data: { isDefault: true }
      })

      console.log('Default payment method updated')
    }
  } catch (error) {
    console.error('Error updating customer:', error)
  }
}
