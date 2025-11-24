import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayPalWebhook } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    // In production, verify webhook signature
    if (process.env.PAYPAL_WEBHOOK_ID && process.env.NODE_ENV === 'production') {
      const isValid = await verifyPayPalWebhook(
        headers,
        body,
        process.env.PAYPAL_WEBHOOK_ID
      )

      if (!isValid) {
        console.error('Invalid PayPal webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const eventType = body.event_type
    console.log(`PayPal webhook received: ${eventType}`)

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(body)
        break

      case 'PAYMENT.CAPTURE.COMPLETED':
        await handleCaptureCompleted(body)
        break

      case 'PAYMENT.CAPTURE.DENIED':
        await handleCaptureDenied(body)
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleCaptureRefunded(body)
        break

      default:
        console.log(`Unhandled PayPal event type: ${eventType}`)
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

async function handleOrderApproved(event: any) {
  const orderId = event.resource.id
  console.log(`PayPal order approved: ${orderId}`)

  // Find payment by order ID
  const payment = await (prisma as any).payment.findFirst({
    where: { stripePaymentId: orderId }
  })

  if (payment) {
    await (prisma as any).payment.update({
      where: { id: payment.id },
      data: { status: 'PROCESSING' }
    })
  }
}

async function handleCaptureCompleted(event: any) {
  const captureId = event.resource.id
  const orderId = event.resource.supplementary_data?.related_ids?.order_id
  const amount = parseFloat(event.resource.amount.value)
  const currency = event.resource.amount.currency_code

  console.log(`PayPal capture completed: ${captureId}`)

  // Find payment by order ID
  const payment = await (prisma as any).payment.findFirst({
    where: { stripePaymentId: orderId },
    include: { booking: true }
  })

  if (!payment) {
    console.error(`Payment not found for PayPal order ${orderId}`)
    return
  }

  // Update payment status
  await (prisma as any).payment.update({
    where: { id: payment.id },
    data: { status: 'PAID' }
  })

  // Update booking status
  await (prisma as any).booking.update({
    where: { id: payment.bookingId },
    data: { status: 'CONFIRMED' }
  })

  // Create transaction record
  await (prisma as any).transaction.create({
    data: {
      userId: payment.booking.guestId,
      bookingId: payment.bookingId,
      description: `PayPal payment for booking ${payment.bookingId}`,
      amount,
      status: 'PAID',
      type: 'RESERVATION',
      paymentMethod: 'PayPal',
      stripeChargeId: captureId,
      date: new Date()
    }
  })

  console.log(`Payment processed successfully for booking ${payment.bookingId}`)
}

async function handleCaptureDenied(event: any) {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id
  console.log(`PayPal capture denied: ${orderId}`)

  // Find payment by order ID
  const payment = await (prisma as any).payment.findFirst({
    where: { stripePaymentId: orderId },
    include: { booking: true }
  })

  if (!payment) {
    console.error(`Payment not found for PayPal order ${orderId}`)
    return
  }

  // Update payment status
  await (prisma as any).payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED' }
  })

  // Update booking status
  await (prisma as any).booking.update({
    where: { id: payment.bookingId },
    data: { status: 'CANCELLED' }
  })

  // Create failed transaction record
  await (prisma as any).transaction.create({
    data: {
      userId: payment.booking.guestId,
      bookingId: payment.bookingId,
      description: `PayPal payment failed for booking ${payment.bookingId}`,
      amount: payment.amount,
      status: 'FAILED',
      type: 'RESERVATION',
      paymentMethod: 'PayPal',
      date: new Date()
    }
  })

  console.log(`Payment denied for booking ${payment.bookingId}`)
}

async function handleCaptureRefunded(event: any) {
  const captureId = event.resource.id
  const amount = parseFloat(event.resource.amount.value)
  const currency = event.resource.amount.currency_code

  console.log(`PayPal refund processed: ${captureId}`)

  // Find transaction by capture ID
  const transaction = await (prisma as any).transaction.findFirst({
    where: { stripeChargeId: captureId }
  })

  if (!transaction) {
    console.error(`Transaction not found for PayPal capture ${captureId}`)
    return
  }

  // Create refund transaction
  await (prisma as any).transaction.create({
    data: {
      userId: transaction.userId,
      bookingId: transaction.bookingId,
      description: `PayPal refund for booking ${transaction.bookingId}`,
      amount: amount,
      status: 'REFUNDED',
      type: 'REFUND',
      paymentMethod: 'PayPal',
      stripeChargeId: captureId,
      date: new Date()
    }
  })

  // Update booking status
  if (transaction.bookingId) {
    await (prisma as any).booking.update({
      where: { id: transaction.bookingId },
      data: { status: 'REFUNDED' }
    })
  }

  console.log(`Refund processed for booking ${transaction.bookingId}`)
}
