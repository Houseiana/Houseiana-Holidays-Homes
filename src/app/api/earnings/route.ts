import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PaymentAPI } from '@/lib/backend-api'

// GET /api/earnings - Get host earnings and payouts via Backend API
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const hostId = user.userId

    console.log('💰 Fetching earnings via backend API for host:', hostId)

    // Backend handles all earnings calculations:
    // - Month-to-date bookings and revenue
    // - ADR and occupancy calculations
    // - Payout history and upcoming payouts
    const response = await PaymentAPI.getHostEarnings(hostId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json(
        { error: response.error || 'Failed to fetch earnings' },
        { status: 500 }
      )
    }

    console.log('✅ Earnings fetched via backend API')

    return NextResponse.json({
      success: true,
      ...response.data
    })

  } catch (error) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
