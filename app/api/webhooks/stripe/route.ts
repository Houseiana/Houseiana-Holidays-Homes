import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for payments and identity verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      // ==========================================
      // IDENTITY VERIFICATION EVENTS
      // ==========================================
      case 'identity.verification_session.verified':
        await handleVerificationVerified(event.data.object as Stripe.Identity.VerificationSession)
        break

      case 'identity.verification_session.requires_input':
        await handleVerificationRequiresInput(event.data.object as Stripe.Identity.VerificationSession)
        break

      case 'identity.verification_session.canceled':
        await handleVerificationCanceled(event.data.object as Stripe.Identity.VerificationSession)
        break

      case 'identity.verification_session.processing':
        await handleVerificationProcessing(event.data.object as Stripe.Identity.VerificationSession)
        break

      // ==========================================
      // PAYMENT EVENTS (for future expansion)
      // ==========================================
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object.id)
        break

      case 'payment_intent.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ==========================================
// IDENTITY VERIFICATION HANDLERS
// ==========================================

async function handleVerificationVerified(session: Stripe.Identity.VerificationSession) {
  try {
    console.log(`Verification verified: ${session.id}`)

    const userId = session.metadata?.userId

    if (!userId) {
      console.error('No userId in verification session metadata')
      return
    }

    // Extract verified data
    const verifiedOutputs = session.verified_outputs

    // Update user KYC status in database
    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        kycStatus: 'VERIFIED',
        kycVerifiedAt: new Date(),
        kycVerificationId: session.id,
        // Optionally store verified data
        firstName: verifiedOutputs?.first_name || undefined,
        lastName: verifiedOutputs?.last_name || undefined,
      }
    })

    console.log(`User ${userId} KYC verified successfully`)

  } catch (error) {
    console.error('Error handling verification verified:', error)
  }
}

async function handleVerificationRequiresInput(session: Stripe.Identity.VerificationSession) {
  try {
    console.log(`Verification requires input: ${session.id}`)

    const userId = session.metadata?.userId

    if (!userId) {
      console.error('No userId in verification session metadata')
      return
    }

    // Update user KYC status
    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING',
        kycVerificationId: session.id,
      }
    })

    console.log(`User ${userId} KYC requires additional input`)

  } catch (error) {
    console.error('Error handling verification requires input:', error)
  }
}

async function handleVerificationCanceled(session: Stripe.Identity.VerificationSession) {
  try {
    console.log(`Verification canceled: ${session.id}`)

    const userId = session.metadata?.userId

    if (!userId) {
      console.error('No userId in verification session metadata')
      return
    }

    // Update user KYC status
    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        kycStatus: 'FAILED',
        kycVerificationId: session.id,
      }
    })

    console.log(`User ${userId} KYC verification canceled`)

  } catch (error) {
    console.error('Error handling verification canceled:', error)
  }
}

async function handleVerificationProcessing(session: Stripe.Identity.VerificationSession) {
  try {
    console.log(`Verification processing: ${session.id}`)

    const userId = session.metadata?.userId

    if (!userId) {
      console.error('No userId in verification session metadata')
      return
    }

    // Update user KYC status
    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING',
        kycVerificationId: session.id,
      }
    })

    console.log(`User ${userId} KYC verification is processing`)

  } catch (error) {
    console.error('Error handling verification processing:', error)
  }
}
