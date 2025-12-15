import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PaymentMethodsAPI } from '@/lib/backend-api'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`💳 Fetching payment methods via backend API for user: ${user.userId}`)

    const response = await PaymentMethodsAPI.getUserPaymentMethods(user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ methods: response.data || [] })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { paymentMethodId } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    console.log(`💳 Adding payment method via backend API for user: ${user.userId}`)

    // Backend handles:
    // - User lookup
    // - Stripe customer creation/lookup
    // - Payment method attachment
    // - Database storage
    const response = await PaymentMethodsAPI.addPaymentMethod(user.userId, paymentMethodId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to add payment method' },
        { status: 400 }
      )
    }

    console.log(`✅ Payment method added via backend API`)

    return NextResponse.json({
      method: response.data,
      message: 'Payment method added successfully'
    })
  } catch (error: any) {
    console.error('Error adding payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
