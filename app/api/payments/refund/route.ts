import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'
import { createSadadRefund } from '@/lib/sadad'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { bookingId, reason, amount } = await request.json()

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
        property: true,
        guest: true,
        host: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user is host or admin
    const isHost = booking.hostId === user.userId
    const isAdmin = user.isAdmin || false

    if (!isHost && !isAdmin) {
      return NextResponse.json(
        { error: 'Only host or admin can process refunds' },
        { status: 403 }
      )
    }

    // Check if booking has been paid
    if (booking.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Booking has not been paid yet' },
        { status: 400 }
      )
    }

    // Check if already refunded
    if (['REFUNDED', 'PARTIALLY_REFUNDED'].includes(booking.paymentStatus)) {
      return NextResponse.json(
        { error: 'Booking has already been refunded' },
        { status: 400 }
      )
    }

    // Get payment intent ID
    if (!booking.paymentIntentId) {
      return NextResponse.json(
        { error: 'No payment intent found for this booking' },
        { status: 400 }
      )
    }

    // Use provided amount or calculate based on policy
    let refundAmount = amount

    if (!refundAmount || refundAmount <= 0) {
      const now = new Date()
      const checkIn = new Date(booking.checkIn)
      const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      const policy = booking.cancellationPolicyType || 'FLEXIBLE'

      switch (policy) {
        case 'FLEXIBLE':
          if (daysUntilCheckIn >= 1) {
            refundAmount = booking.totalPrice
          }
          break
        case 'MODERATE':
          if (daysUntilCheckIn >= 5) {
            refundAmount = booking.totalPrice
          } else if (daysUntilCheckIn >= 1) {
            refundAmount = booking.totalPrice * 0.5 // 50% refund
          }
          break
        case 'STRICT':
          if (daysUntilCheckIn >= 14) {
            refundAmount = booking.totalPrice
          } else if (daysUntilCheckIn >= 7) {
            refundAmount = booking.totalPrice * 0.5 // 50% refund
          }
          break
        case 'SUPER_STRICT':
          if (daysUntilCheckIn >= 30) {
            refundAmount = booking.totalPrice
          } else if (daysUntilCheckIn >= 14) {
            refundAmount = booking.totalPrice * 0.5 // 50% refund
          }
          break
      }
    }

    if (!refundAmount || refundAmount <= 0) {
      return NextResponse.json(
        { error: 'No refund available based on cancellation policy' },
        { status: 400 }
      )
    }

    // Process refund with Sadad (using invoice number stored in paymentIntentId)
    try {
      const refund = await createSadadRefund({
        transactionNumber: booking.paymentIntentId, // Sadad invoice number
        amount: refundAmount,
        reason: reason || 'Cancellation refund'
      })

      // Update booking with refund information
      const isFullRefund = refundAmount >= booking.totalPrice
      const updatedBooking = await (prisma as any).booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundAmount,
          refundedAt: new Date(),
          refundReason: reason || 'Cancellation refund'
        }
      })

      return NextResponse.json({
        success: true,
        refund: {
          id: refund.refundId,
          amount: refundAmount,
          currency: 'QAR',
          status: refund.status
        },
        booking: updatedBooking
      })

    } catch (sadadError: any) {
      console.error('Sadad refund error:', sadadError)
      return NextResponse.json(
        { error: `Refund failed: ${sadadError.message}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
