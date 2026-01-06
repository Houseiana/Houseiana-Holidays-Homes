import { NextRequest, NextResponse } from 'next/server'
import { BookingExtendedAPI } from '@/lib/backend-api'

/**
 * GET /api/bookings/verify?id=booking_123
 *
 * Verify booking payment status by checking directly with the payment gateway.
 * This is the SINGLE SOURCE OF TRUTH for payment confirmation.
 *
 * Backend handles:
 * 1. Check if booking already CONFIRMED → return success
 * 2. If booking status is AWAITING_PAYMENT → query payment gateway API
 * 3. If payment found → update booking to CONFIRMED
 * 4. If payment not found → return current status
 * 5. Send confirmation/failure emails as needed
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

    console.log(`🔍 Verifying booking payment via backend API: ${bookingId}`)

    // Backend handles all verification logic:
    // - Booking lookup with payment details
    // - Hold expiration checks
    // - Payment gateway verification (PayPal, Stripe, etc.)
    // - Database updates
    // - Email notifications
    const response = await BookingExtendedAPI.verifyPayment(bookingId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      // Return the backend error response with booking status if available
      return NextResponse.json({
        success: false,
        booking: response.data?.booking,
        error: response.error || 'Failed to verify payment',
      })
    }

    console.log(`✅ Booking payment verified via backend API`)

    return NextResponse.json({
      success: true,
      ...response.data
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
