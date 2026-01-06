import { NextRequest, NextResponse } from 'next/server'
import { WebhookAPI } from '@/lib/backend-api'

/**
 * POST /api/webhooks/stripe
 * Receives Stripe webhooks and forwards to backend for processing
 * Signature verification is handled by the Backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Forward raw body and signature to backend for verification and processing
    const response = await WebhookAPI.handleStripeWebhook({
      rawBody: body,
      signature,
    })

    if (!response.success) {
      console.error('❌ Backend API error processing Stripe webhook:', response.error)
    } else {
      console.log('✅ Stripe webhook processed via backend API')
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
