import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Capture the PayPal order
    const captureData = await capturePayPalOrder(orderId)

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment capture failed', status: captureData.status },
        { status: 400 }
      )
    }

    // Find the payment record
    const payment = await (prisma as any).payment.findFirst({
      where: {
        stripePaymentId: orderId // We stored PayPal order ID here
      },
      include: {
        booking: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      )
    }

    // Verify user owns this payment
    if (payment.booking.guestId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update payment status
    await (prisma as any).payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        updatedAt: new Date()
      }
    })

    // Update booking status
    await (prisma as any).booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date()
      }
    })

    // Create transaction record
    const captureAmount = parseFloat(
      captureData.purchase_units[0].payments.captures[0].amount.value
    )
    const captureCurrency = captureData.purchase_units[0].payments.captures[0].amount.currency_code

    await (prisma as any).transaction.create({
      data: {
        userId: user.userId,
        bookingId: payment.bookingId,
        description: `PayPal payment for booking ${payment.bookingId}`,
        amount: captureAmount,
        status: 'PAID',
        type: 'RESERVATION',
        paymentMethod: 'PayPal',
        stripeChargeId: captureData.purchase_units[0].payments.captures[0].id,
        date: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      orderId: captureData.id,
      captureId: captureData.purchase_units[0].payments.captures[0].id,
      status: captureData.status,
      amount: captureAmount,
      currency: captureCurrency
    })

  } catch (error: any) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
