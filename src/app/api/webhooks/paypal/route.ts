import { NextRequest, NextResponse } from 'next/server'
import { WebhookAPI } from '@/lib/backend-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Webhook signature verification is handled by the Backend API
    const eventType = body.event_type
    console.log(`💳 PayPal webhook received: ${eventType}`)

    // Forward the webhook event to backend for processing
    // Backend handles all database updates (payment status, booking updates, transactions)
    const response = await WebhookAPI.handlePayPalWebhook({
      event_type: eventType,
      resource: body.resource,
    })

    if (!response.success) {
      console.error('❌ Backend API error processing PayPal webhook:', response.error)
      // Return 200 to PayPal to acknowledge receipt
    } else {
      console.log('✅ PayPal webhook processed via backend API')
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
