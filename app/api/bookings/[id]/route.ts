import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'

// PATCH /api/bookings/[id] - Update booking status (approve/decline/cancel/pay)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, reason, paymentIntentId, refundAmount } = await request.json()
    const bookingId = params.id

    // Get the booking with property details
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
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
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'approve':
        // Only host can approve
        if (booking.hostId !== user.userId) {
          return NextResponse.json(
            { error: 'Only the host can approve this booking' },
            { status: 403 }
          )
        }

        // Can only approve REQUESTED bookings
        if (booking.status !== 'REQUESTED') {
          return NextResponse.json(
            { error: `Cannot approve booking with status ${booking.status}` },
            { status: 400 }
          )
        }

        // Update booking to APPROVED status
        const approvedBooking = await (prisma as any).booking.update({
          where: { id: bookingId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            // Extend hold expiry for payment (e.g., 48 hours from approval)
            holdExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
          }
        })

        // TODO: Send notification to guest that booking was approved
        // TODO: Create payment intent

        return NextResponse.json({
          success: true,
          booking: approvedBooking,
          message: 'Booking approved successfully'
        })

      case 'decline':
      case 'reject':
        // Only host can decline
        if (booking.hostId !== user.userId) {
          return NextResponse.json(
            { error: 'Only the host can decline this booking' },
            { status: 403 }
          )
        }

        // Can only decline REQUESTED or APPROVED bookings
        if (!['REQUESTED', 'APPROVED'].includes(booking.status)) {
          return NextResponse.json(
            { error: `Cannot decline booking with status ${booking.status}` },
            { status: 400 }
          )
        }

        // Update booking to REJECTED status and release availability
        const rejectedBooking = await (prisma as any).$transaction(async (tx: any) => {
          // Update booking
          const updated = await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: 'REJECTED',
              cancelledAt: new Date(),
              cancelledBy: 'HOST',
              cancellationReason: reason || 'Declined by host'
            }
          })

          // Release availability dates
          const datesToRelease = []
          for (let d = new Date(booking.checkIn); d < booking.checkOut; d.setDate(d.getDate() + 1)) {
            datesToRelease.push(new Date(d))
          }

          await tx.availability.updateMany({
            where: {
              propertyId: booking.propertyId,
              date: { in: datesToRelease }
            },
            data: {
              available: true
            }
          })

          return updated
        })

        // TODO: Send notification to guest that booking was declined
        // TODO: Process refund if payment was captured

        return NextResponse.json({
          success: true,
          booking: rejectedBooking,
          message: 'Booking declined successfully'
        })

      case 'cancel':
        // Guest or host can cancel
        const isGuest = booking.guestId === user.userId
        const isHost = booking.hostId === user.userId

        if (!isGuest && !isHost) {
          return NextResponse.json(
            { error: 'You do not have permission to cancel this booking' },
            { status: 403 }
          )
        }

        // Cannot cancel COMPLETED or already CANCELLED bookings
        if (['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(booking.status)) {
          return NextResponse.json(
            { error: `Cannot cancel booking with status ${booking.status}` },
            { status: 400 }
          )
        }

        // Calculate refund amount based on cancellation policy
        let calculatedRefundAmount = 0
        const now = new Date()
        const checkIn = new Date(booking.checkIn)
        const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (booking.paymentStatus === 'PAID') {
          const policy = booking.cancellationPolicyType || 'FLEXIBLE'

          switch (policy) {
            case 'FLEXIBLE':
              if (daysUntilCheckIn >= 1) {
                calculatedRefundAmount = booking.totalPrice
              }
              break
            case 'MODERATE':
              if (daysUntilCheckIn >= 5) {
                calculatedRefundAmount = booking.totalPrice
              } else if (daysUntilCheckIn >= 1) {
                calculatedRefundAmount = booking.totalPrice * 0.5 // 50% refund
              }
              break
            case 'STRICT':
              if (daysUntilCheckIn >= 14) {
                calculatedRefundAmount = booking.totalPrice
              } else if (daysUntilCheckIn >= 7) {
                calculatedRefundAmount = booking.totalPrice * 0.5 // 50% refund
              }
              break
            case 'SUPER_STRICT':
              if (daysUntilCheckIn >= 30) {
                calculatedRefundAmount = booking.totalPrice
              } else if (daysUntilCheckIn >= 14) {
                calculatedRefundAmount = booking.totalPrice * 0.5 // 50% refund
              }
              break
          }
        }

        // Update booking to CANCELLED status and release availability
        const cancelledBooking = await (prisma as any).$transaction(async (tx: any) => {
          // Update booking
          const updated = await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
              cancelledBy: isGuest ? 'GUEST' : 'HOST',
              cancellationReason: reason || `Cancelled by ${isGuest ? 'guest' : 'host'}`,
              refundAmount: calculatedRefundAmount,
              paymentStatus: calculatedRefundAmount > 0 ? 'REFUNDED' : booking.paymentStatus
            }
          })

          // Release availability dates
          const datesToRelease = []
          for (let d = new Date(booking.checkIn); d < booking.checkOut; d.setDate(d.getDate() + 1)) {
            datesToRelease.push(new Date(d))
          }

          await tx.availability.updateMany({
            where: {
              propertyId: booking.propertyId,
              date: { in: datesToRelease }
            },
            data: {
              available: true
            }
          })

          return updated
        })

        // TODO: Process refund via payment gateway
        // TODO: Send notifications to guest and host

        return NextResponse.json({
          success: true,
          booking: cancelledBooking,
          refundAmount: calculatedRefundAmount,
          message: 'Booking cancelled successfully'
        })

      case 'mark-paid':
        // Mark payment as successful (used by payment webhook or manual confirmation)
        if (!['REQUESTED', 'APPROVED'].includes(booking.status)) {
          return NextResponse.json(
            { error: `Cannot mark as paid for booking with status ${booking.status}` },
            { status: 400 }
          )
        }

        const paidBooking = await (prisma as any).booking.update({
          where: { id: bookingId },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentIntentId: paymentIntentId || null,
            paymentCapturedAt: new Date(),
            confirmedAt: new Date(),
            holdExpiresAt: null // Clear hold expiry since payment is confirmed
          }
        })

        // TODO: Send confirmation notifications to guest and host

        return NextResponse.json({
          success: true,
          booking: paidBooking,
          message: 'Payment confirmed, booking is now confirmed'
        })

      case 'check-in':
        // Mark guest as checked in
        if (booking.hostId !== user.userId) {
          return NextResponse.json(
            { error: 'Only the host can check in guests' },
            { status: 403 }
          )
        }

        if (booking.status !== 'CONFIRMED') {
          return NextResponse.json(
            { error: 'Can only check in confirmed bookings' },
            { status: 400 }
          )
        }

        const checkedInBooking = await (prisma as any).booking.update({
          where: { id: bookingId },
          data: {
            status: 'CHECKED_IN'
          }
        })

        return NextResponse.json({
          success: true,
          booking: checkedInBooking,
          message: 'Guest checked in successfully'
        })

      case 'complete':
        // Mark booking as completed after checkout
        if (booking.hostId !== user.userId && booking.guestId !== user.userId) {
          return NextResponse.json(
            { error: 'You do not have permission to complete this booking' },
            { status: 403 }
          )
        }

        if (!['CONFIRMED', 'CHECKED_IN'].includes(booking.status)) {
          return NextResponse.json(
            { error: 'Can only complete confirmed or checked-in bookings' },
            { status: 400 }
          )
        }

        const completedBooking = await (prisma as any).booking.update({
          where: { id: bookingId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        })

        // TODO: Trigger review eligibility notifications

        return NextResponse.json({
          success: true,
          booking: completedBooking,
          message: 'Booking completed successfully'
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Soft delete a booking (admin only or permanent delete for cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const bookingId = params.id

    // Get the booking
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled or rejected bookings
    if (!['CANCELLED', 'REJECTED'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Can only delete cancelled or rejected bookings' },
        { status: 400 }
      )
    }

    // Only guest can delete their own bookings
    if (booking.guestId !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this booking' },
        { status: 403 }
      )
    }

    // Soft delete by setting deletedAt
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        deletedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
