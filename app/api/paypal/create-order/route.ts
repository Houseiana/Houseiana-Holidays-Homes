import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createPayPalOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            host: true
          }
        },
        guest: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user owns this booking
    if (booking.guestId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if booking is in correct status (AWAITING_PAYMENT for instant book, or PENDING for request-to-book)
    if (booking.status !== 'AWAITING_PAYMENT' && booking.status !== 'PENDING' && booking.status !== 'REQUESTED') {
      return NextResponse.json(
        { error: `Booking cannot be paid. Current status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Create PayPal order
    const order = await createPayPalOrder(
      booking.totalAmount,
      booking.currency || 'USD',
      {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        guestId: booking.guestId,
        hostId: booking.hostId
      }
    )

    // Create payment record
    await (prisma as any).payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency || 'USD',
        status: 'PENDING',
        method: 'paypal',
        stripePaymentId: order.id // Using this field for PayPal order ID
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: booking.totalAmount,
      currency: booking.currency || 'USD',
      status: order.status
    })

  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
