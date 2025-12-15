import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PaymentAPI } from '@/lib/backend-api'

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

    console.log('💳 Creating PayPal order via backend API for booking:', bookingId)

    // Backend handles:
    // - Booking validation
    // - User ownership verification
    // - Status checking
    // - PayPal order creation
    // - Payment record creation
    const response = await PaymentAPI.createPayPalOrderForBooking(bookingId, user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      // Map backend errors to appropriate HTTP status codes
      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: response.error },
          { status: 404 }
        )
      }
      if (response.error?.includes('Unauthorized') || response.error?.includes('permission')) {
        return NextResponse.json(
          { error: response.error },
          { status: 403 }
        )
      }
      if (response.error?.includes('cannot be paid') || response.error?.includes('status')) {
        return NextResponse.json(
          { error: response.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to create PayPal order' },
        { status: 400 }
      )
    }

    console.log('✅ PayPal order created via backend API:', response.data?.orderId)

    return NextResponse.json(response.data)

  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
