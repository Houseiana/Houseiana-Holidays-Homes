import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PaymentMethodsAPI } from '@/lib/backend-api'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log(`💳 Fetching payment history via backend API for user: ${user.userId}`)

    // Backend handles all payment data fetching:
    // - Transaction history
    // - Payment methods
    // - Upcoming charges
    // - Summary calculations
    const response = await PaymentMethodsAPI.getPaymentHistory(user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log(`✅ Payment history fetched via backend API`)

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
