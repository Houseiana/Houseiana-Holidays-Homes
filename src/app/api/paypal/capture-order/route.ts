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

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    console.log('💳 Capturing PayPal order via backend API:', orderId)

    // Backend handles:
    // - PayPal order capture
    // - Payment record update
    // - Booking status update
    // - Transaction record creation
    // - User authorization verification
    const response = await PaymentAPI.capturePayPalOrder(orderId, user.userId)

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
      if (response.error?.includes('failed') || response.error?.includes('capture')) {
        return NextResponse.json(
          { error: response.error, status: 'FAILED' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to capture PayPal order' },
        { status: 400 }
      )
    }

    console.log('✅ PayPal order captured via backend API:', response.data?.captureId)

    return NextResponse.json({
      success: true,
      ...response.data
    })

  } catch (error: any) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
