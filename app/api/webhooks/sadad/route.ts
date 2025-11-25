import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { verifySadadWebhook } from '@/lib/sadad'
import { headers } from 'next/headers'

/**
 * Sadad Qatar Webhook Handler
 * Receives payment notifications from Sadad Payment Gateway
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-sadad-signature') || headersList.get('signature')

    // Verify webhook signature (if Sadad provides one)
    if (signature && !verifySadadWebhook(body, signature)) {
      console.error('Invalid Sadad webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const webhookData = JSON.parse(body)
    console.log('Sadad webhook received:', webhookData.event || webhookData.status)

    // Handle different webhook events based on Sadad's format
    const eventType = webhookData.event || webhookData.status || webhookData.transaction_status

    switch (eventType) {
      case 'payment.success':
      case 'paid':
      case 'success':
      case 'completed':
        await handlePaymentSuccess(webhookData)
        break

      case 'payment.failed':
      case 'failed':
      case 'declined':
        await handlePaymentFailed(webhookData)
        break

      case 'payment.cancelled':
      case 'cancelled':
      case 'canceled':
        await handlePaymentCancelled(webhookData)
        break

      case 'refund.success':
      case 'refunded':
        await handleRefundSuccess(webhookData)
        break

      default:
        console.log(`Unhandled Sadad event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Sadad webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(data: any) {
  const transactionId = data.transaction_id || data.id
  const merchantReference = data.merchant_reference || data.reference

  console.log('Payment succeeded:', transactionId)

  try {
    // Find booking by transaction ID or merchant reference
    const booking = await (prisma as any).booking.findFirst({
      where: {
        OR: [
          { paymentIntentId: transactionId },
          { transactionId: merchantReference }
        ]
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

    if (!booking) {
      console.error(`No booking found for transaction ${transactionId}`)
      return
    }

    // Update booking to CONFIRMED status with PAID payment status
    await (prisma as any).booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentCapturedAt: new Date(),
        confirmedAt: new Date(),
        holdExpiresAt: null // Clear hold expiry since payment is confirmed
      }
    })

    console.log(`Booking ${booking.id} confirmed - payment successful`)

    // TODO: Send confirmation email/notification to guest and host
    // TODO: Add to audit log

  } catch (error) {
    console.error('Error updating booking after payment success:', error)
    throw error
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(data: any) {
  const transactionId = data.transaction_id || data.id
  const merchantReference = data.merchant_reference || data.reference

  console.log('Payment failed:', transactionId)

  try {
    // Find booking
    const booking = await (prisma as any).booking.findFirst({
      where: {
        OR: [
          { paymentIntentId: transactionId },
          { transactionId: merchantReference }
        ]
      }
    })

    if (!booking) {
      console.error(`No booking found for transaction ${transactionId}`)
      return
    }

    // Update booking payment status to FAILED
    // Keep the booking in REQUESTED/APPROVED status to allow retry
    await (prisma as any).booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'FAILED'
      }
    })

    console.log(`Booking ${booking.id} payment failed - status updated`)

    // TODO: Send notification to guest about payment failure

  } catch (error) {
    console.error('Error updating booking after payment failure:', error)
    throw error
  }
}

/**
 * Handle cancelled payment
 */
async function handlePaymentCancelled(data: any) {
  const transactionId = data.transaction_id || data.id
  const merchantReference = data.merchant_reference || data.reference

  console.log('Payment cancelled:', transactionId)

  try {
    // Find booking
    const booking = await (prisma as any).booking.findFirst({
      where: {
        OR: [
          { paymentIntentId: transactionId },
          { transactionId: merchantReference }
        ]
      }
    })

    if (!booking) {
      console.error(`No booking found for transaction ${transactionId}`)
      return
    }

    // If booking is not yet confirmed, mark as expired
    if (['REQUESTED', 'APPROVED', 'PENDING'].includes(booking.status)) {
      await (prisma as any).booking.update({
        where: { id: booking.id },
        data: {
          status: 'EXPIRED',
          paymentStatus: 'FAILED'
        }
      })

      console.log(`Booking ${booking.id} marked as expired due to cancelled payment`)

      // TODO: Release availability holds
      // TODO: Send notification
    }

  } catch (error) {
    console.error('Error handling cancelled payment:', error)
    throw error
  }
}

/**
 * Handle successful refund
 */
async function handleRefundSuccess(data: any) {
  const transactionId = data.transaction_id || data.original_transaction_id || data.id
  const refundAmount = data.refund_amount || data.amount

  console.log('Refund processed:', transactionId)

  try {
    // Find booking by transaction ID
    const booking = await (prisma as any).booking.findFirst({
      where: { paymentIntentId: transactionId }
    })

    if (!booking) {
      console.error(`No booking found for transaction ${transactionId}`)
      return
    }

    // Convert refund amount to decimal if it's in cents/dirhams
    const refundAmountDecimal = typeof refundAmount === 'number' && refundAmount > 1000
      ? refundAmount / 100
      : refundAmount

    // Determine if full or partial refund
    const isFullRefund = refundAmountDecimal >= booking.totalPrice

    // Update booking with refund information
    await (prisma as any).booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount: refundAmountDecimal,
        refundedAt: new Date(),
        refundReason: data.reason || 'Sadad refund processed'
      }
    })

    console.log(`Booking ${booking.id} refunded: ${refundAmountDecimal}`)

    // TODO: Send refund confirmation to guest

  } catch (error) {
    console.error('Error updating booking after refund:', error)
    throw error
  }
}
