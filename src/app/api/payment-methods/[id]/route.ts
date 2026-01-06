import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PaymentMethodsAPI } from '@/lib/backend-api'

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

    const methodId = params.id

    console.log(`🗑️ Deleting payment method via backend API: ${methodId}`)

    // Backend handles:
    // - Ownership verification
    // - Stripe payment method detachment
    // - Database deletion
    const response = await PaymentMethodsAPI.deletePaymentMethod(methodId, user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Payment method not found' },
          { status: 404 }
        )
      }
      if (response.error?.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to delete payment method' },
        { status: 400 }
      )
    }

    console.log(`✅ Payment method deleted via backend API`)

    return NextResponse.json({
      message: 'Payment method deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const methodId = params.id
    const { action } = await request.json()

    if (action !== 'set-default') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    console.log(`⭐ Setting default payment method via backend API: ${methodId}`)

    // Backend handles:
    // - Ownership verification
    // - Stripe default update
    // - Database updates (unset others, set this one)
    const response = await PaymentMethodsAPI.setDefaultPaymentMethod(methodId, user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Payment method not found' },
          { status: 404 }
        )
      }
      if (response.error?.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      if (response.error?.includes('Stripe customer')) {
        return NextResponse.json(
          { error: 'Stripe customer not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to update payment method' },
        { status: 400 }
      )
    }

    console.log(`✅ Default payment method updated via backend API`)

    return NextResponse.json({
      message: 'Default payment method updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
