import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

if (process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
  console.warn('⚠️ WARNING: Using placeholder Stripe key. Please update STRIPE_SECRET_KEY in your environment variables.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'qar', // Qatar Riyal
  defaultCurrency: 'QAR',
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const { prisma } = await import('@/lib/prisma-server')

  // Check if user already has a Stripe customer ID
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true }
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
      platform: 'houseiana'
    }
  })

  // Save customer ID to database
  await (prisma as any).user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  })

  return customer.id
}

export async function createPaymentIntent(
  amount: number,
  currency: string,
  customerId: string,
  metadata: Record<string, string>
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    customer: customerId,
    metadata,
    automatic_payment_methods: {
      enabled: true
    }
  })
}

export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  }

  if (amount) {
    refundData.amount = Math.round(amount * 100)
  }

  if (reason) {
    refundData.reason = reason as Stripe.RefundCreateParams.Reason
  }

  return await stripe.refunds.create(refundData)
}

export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
) {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId
  })
}

export async function detachPaymentMethod(paymentMethodId: string) {
  return await stripe.paymentMethods.detach(paymentMethodId)
}

export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  })
}

export async function listPaymentMethods(customerId: string) {
  return await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card'
  })
}

// =============================================
// STRIPE IDENTITY - KYC VERIFICATION
// =============================================

/**
 * Creates a Stripe Identity verification session for KYC
 * @param userId - The user ID to verify
 * @param returnUrl - URL to redirect to after verification
 * @returns Verification session with client_secret and url
 */
export async function createVerificationSession(
  userId: string,
  email: string,
  returnUrl: string
) {
  try {
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document', // Can be 'document' or 'id_number'
      metadata: {
        userId,
        email,
        platform: 'houseiana'
      },
      options: {
        document: {
          // Accept passport, driving license, or ID card
          allowed_types: ['passport', 'driving_license', 'id_card'],
          // Require matching selfie for extra security
          require_matching_selfie: true,
        }
      },
      return_url: returnUrl,
    })

    return verificationSession
  } catch (error) {
    console.error('Error creating verification session:', error)
    throw error
  }
}

/**
 * Retrieves a verification session by ID
 * @param sessionId - The verification session ID
 */
export async function getVerificationSession(sessionId: string) {
  try {
    return await stripe.identity.verificationSessions.retrieve(sessionId, {
      expand: ['verified_outputs']
    })
  } catch (error) {
    console.error('Error retrieving verification session:', error)
    throw error
  }
}

/**
 * Cancels a verification session
 * @param sessionId - The verification session ID to cancel
 */
export async function cancelVerificationSession(sessionId: string) {
  try {
    return await stripe.identity.verificationSessions.cancel(sessionId)
  } catch (error) {
    console.error('Error canceling verification session:', error)
    throw error
  }
}

/**
 * Lists all verification sessions for a user
 * @param userId - The user ID
 */
export async function listVerificationSessions(userId: string) {
  try {
    return await stripe.identity.verificationSessions.list({
      limit: 10,
    })
  } catch (error) {
    console.error('Error listing verification sessions:', error)
    throw error
  }
}
