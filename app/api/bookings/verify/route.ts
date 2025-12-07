import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { checkPaymentGatewayStatus, PaymentProvider } from '@/lib/payment-gateways'
import { sendEmail, getBookingConfirmationEmail, getPaymentFailedEmail } from '@/lib/email'

/**
 * GET /api/bookings/verify?id=booking_123
 *
 * Verify booking payment status by checking directly with the payment gateway.
 * This is the SINGLE SOURCE OF TRUTH for payment confirmation.
 *
 * Flow:
 * 1. Check if booking already CONFIRMED → return success
 * 2. If booking status is AWAITING_PAYMENT → query payment gateway API
 * 3. If payment found → update booking to CONFIRMED
 * 4. If payment not found → return current status
 *
 * Security: Never trust client-side payment confirmations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Fetch booking with payment details
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        transactionId: true,
        paymentIntentId: true,
        totalPrice: true,
        amountPaid: true,
        confirmedAt: true,
        holdExpiresAt: true,
        confirmationCode: true,
        checkIn: true,
        checkOut: true,
        property: {
          select: {
            id: true,
            title: true,
          }
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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

    // Case 1: Booking already confirmed
    if (booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          confirmedAt: booking.confirmedAt,
        },
        message: 'Booking already confirmed',
      })
    }

    // Case 2: Booking expired (hold time passed)
    if (booking.status === 'AWAITING_PAYMENT' && booking.holdExpiresAt) {
      const now = new Date()
      const holdExpiry = new Date(booking.holdExpiresAt)

      if (holdExpiry <= now) {
        // Update to EXPIRED status
        await (prisma as any).booking.update({
          where: { id: bookingId },
          data: { status: 'EXPIRED' }
        })

        return NextResponse.json({
          success: false,
          booking: {
            id: booking.id,
            status: 'EXPIRED',
            paymentStatus: booking.paymentStatus,
          },
          error: 'Booking hold expired. Please create a new booking.',
        })
      }
    }

    // Case 3: Booking awaiting payment - verify with payment gateway
    if (booking.status === 'AWAITING_PAYMENT') {
      // Determine payment provider and order ID
      const paymentOrderId = booking.paymentIntentId || booking.transactionId
      let provider: PaymentProvider | null = null

      if (booking.paymentMethod) {
        const method = booking.paymentMethod.toLowerCase()
        if (method.includes('paypal')) {
          provider = 'paypal'
        } else if (method.includes('stripe') || method.includes('card')) {
          provider = 'stripe'
        } else if (method.includes('apple')) {
          provider = 'apple_pay'
        } else if (method.includes('google')) {
          provider = 'google_pay'
        }
      }

      // If we have payment order ID and provider, verify with gateway
      if (paymentOrderId && provider) {
        console.log(`Verifying payment with ${provider}: ${paymentOrderId}`)

        const verificationResult = await checkPaymentGatewayStatus(paymentOrderId, provider)

        if (verificationResult.success && verificationResult.status === 'COMPLETED') {
          // Payment confirmed! Determine if this is initial payment or balance payment
          const paymentAmount = verificationResult.amount || 0
          const currentAmountPaid = booking.amountPaid || 0
          const totalAmountPaid = currentAmountPaid + paymentAmount

          // Determine final payment status
          const isFullyPaid = totalAmountPaid >= booking.totalPrice
          const finalPaymentStatus = isFullyPaid ? 'PAID' : 'PARTIALLY_PAID'

          // Update booking
          const confirmedBooking = await (prisma as any).booking.update({
            where: { id: bookingId },
            data: {
              status: booking.status === 'AWAITING_PAYMENT' ? 'CONFIRMED' : booking.status,
              paymentStatus: finalPaymentStatus,
              amountPaid: totalAmountPaid,
              confirmedAt: booking.confirmedAt || new Date(),
              transactionId: verificationResult.transactionId,
              paymentCapturedAt: new Date(),
            }
          })

          console.log(`✅ Booking ${bookingId} payment verified: $${paymentAmount} (Total paid: $${totalAmountPaid}/${booking.totalPrice})`)

          // Send booking confirmation email if fully paid
          if (isFullyPaid) {
            try {
              const emailTemplate = getBookingConfirmationEmail({
                guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
                propertyTitle: booking.property.title,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalPrice: booking.totalPrice,
                confirmationCode: booking.confirmationCode,
                bookingId: booking.id,
              })

              await sendEmail({
                to: booking.guest.email,
                subject: 'Booking Confirmed - Houseiana Holidays Homes',
                ...emailTemplate,
              })

              console.log(`📧 Booking confirmation email sent to ${booking.guest.email}`)
            } catch (emailError) {
              console.error('❌ Failed to send confirmation email:', emailError)
              // Don't fail the whole request if email fails
            }
          }

          return NextResponse.json({
            success: true,
            booking: {
              id: confirmedBooking.id,
              status: confirmedBooking.status,
              paymentStatus: confirmedBooking.paymentStatus,
              amountPaid: confirmedBooking.amountPaid,
              confirmedAt: confirmedBooking.confirmedAt,
              transactionId: confirmedBooking.transactionId,
            },
            message: isFullyPaid ? 'Payment verified and booking fully paid' : 'Partial payment verified',
          })
        } else if (verificationResult.status === 'PENDING') {
          // Payment still pending
          return NextResponse.json({
            success: false,
            booking: {
              id: booking.id,
              status: 'AWAITING_PAYMENT',
              paymentStatus: 'PENDING',
              holdExpiresAt: booking.holdExpiresAt,
            },
            error: verificationResult.error || 'Payment is still pending',
          })
        } else {
          // Payment failed - send notification email
          try {
            const emailTemplate = getPaymentFailedEmail({
              guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
              propertyTitle: booking.property.title,
              bookingId: booking.id,
              amount: booking.totalPrice - (booking.amountPaid || 0),
            })

            await sendEmail({
              to: booking.guest.email,
              subject: 'Payment Failed - Houseiana Holidays Homes',
              ...emailTemplate,
            })

            console.log(`📧 Payment failed email sent to ${booking.guest.email}`)
          } catch (emailError) {
            console.error('❌ Failed to send payment failed email:', emailError)
            // Don't fail the whole request if email fails
          }

          return NextResponse.json({
            success: false,
            booking: {
              id: booking.id,
              status: 'AWAITING_PAYMENT',
              paymentStatus: 'FAILED',
              holdExpiresAt: booking.holdExpiresAt,
            },
            error: verificationResult.error || 'Payment verification failed',
          })
        }
      } else {
        // No payment order ID or provider - return current status
        return NextResponse.json({
          success: false,
          booking: {
            id: booking.id,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            holdExpiresAt: booking.holdExpiresAt,
          },
          error: 'No payment order ID found for verification',
        })
      }
    }

    // Case 4: Other statuses (REQUESTED, CANCELLED, etc.)
    return NextResponse.json({
      success: false,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
      message: `Booking status: ${booking.status}`,
    })

  } catch (error) {
    console.error('Error verifying booking payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
