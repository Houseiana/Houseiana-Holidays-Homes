import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  currency: 'usd',
  automaticPaymentMethods: {
    enabled: true,
  },
}

/**
 * Create a payment intent for a booking
 */
export async function createStripePaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: {
    bookingId: string
    propertyId?: string
    guestId?: string
    hostId?: string
  }
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    })

    return paymentIntent
  } catch (error) {
    console.error('Stripe Create Payment Intent Error:', error)
    throw error
  }
}

/**
 * Retrieve payment intent
 */
export async function getStripePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Stripe Get Payment Intent Error:', error)
    throw error
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmStripePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Stripe Confirm Payment Intent Error:', error)
    throw error
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelStripePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Stripe Cancel Payment Intent Error:', error)
    throw error
  }
}

/**
 * Create a refund
 */
export async function createStripeRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    })
    return refund
  } catch (error) {
    console.error('Stripe Refund Error:', error)
    throw error
  }
}

/**
 * Attach payment method to customer
 */
export async function attachPaymentMethodToCustomer(
  paymentMethodId: string,
  customerId: string
) {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })
    return paymentMethod
  } catch (error) {
    console.error('Stripe Attach Payment Method Error:', error)
    throw error
  }
}

/**
 * List customer payment methods
 */
export async function listCustomerPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    return paymentMethods.data
  } catch (error) {
    console.error('Stripe List Payment Methods Error:', error)
    throw error
  }
}

export default stripe
