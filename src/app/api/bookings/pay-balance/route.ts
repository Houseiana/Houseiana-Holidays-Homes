import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { BookingExtendedAPI } from '@/lib/backend-api'

/**
 * POST /api/bookings/pay-balance
 *
 * Handle second payment for split payment (50/50) bookings
 * This allows guests to complete payment for PARTIALLY_PAID bookings
 *
 * Backend handles:
 * - Booking validation and ownership verification
 * - Payment status checks
 * - Balance calculation
 * - Payment gateway integration (PayPal/Sadad)
 * - Database updates
 *
 * Security:
 * - Requires authentication
 * - Backend validates booking ownership
 * - Backend prevents duplicate payments
 * - Backend prevents payment after booking expired/cancelled
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { bookingId, paymentProvider } = await request.json()

    // Validate required fields
    if (!bookingId || !paymentProvider) {
      return NextResponse.json(
        { error: 'bookingId and paymentProvider are required' },
        { status: 400 }
      )
    }

    console.log(`💳 Processing balance payment via backend API for booking: ${bookingId}`)

    // Backend handles all balance payment logic
    const response = await BookingExtendedAPI.payBalance(
      bookingId,
      user.userId,
      paymentProvider
    )

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      if (response.error?.includes('permission')) {
        return NextResponse.json(
          { error: 'You do not have permission to pay for this booking' },
          { status: 403 }
        )
      }
      if (response.error?.includes('already been fully paid')) {
        return NextResponse.json(
          { error: 'This booking has already been fully paid' },
          { status: 400 }
        )
      }
      if (response.error?.includes('cancelled') || response.error?.includes('expired')) {
        return NextResponse.json(
          { error: response.error },
          { status: 400 }
        )
      }
      if (response.error?.includes('No balance remaining')) {
        return NextResponse.json(
          { error: 'No balance remaining on this booking' },
          { status: 400 }
        )
      }
      if (response.error?.includes('Unsupported payment provider')) {
        return NextResponse.json(
          { error: response.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to create balance payment' },
        { status: 400 }
      )
    }

    console.log(`✅ Balance payment order created via backend API`)

    return NextResponse.json({
      success: true,
      ...response.data
    })

  } catch (error) {
    console.error('Error creating balance payment:', error)
    return NextResponse.json(
      { error: 'Failed to create balance payment' },
      { status: 500 }
    )
  }
}
