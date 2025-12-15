import { NextRequest, NextResponse } from 'next/server'
import { CronAPI } from '@/lib/backend-api'

// This endpoint should be called by a cron job (e.g., Vercel Cron, or external service)
// It finds all bookings with expired holds and marks them as EXPIRED
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Expire Bookings Cron] Starting...')

    // Backend handles all expiration logic:
    // - Finding bookings with expired holds
    // - Updating booking status
    // - Releasing availability dates
    // - Transaction management
    const response = await CronAPI.expireBookings(cronSecret)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    console.log(`[Expire Bookings Cron] Completed: processed ${response.data?.processed || 0} bookings`)

    return NextResponse.json({
      success: true,
      ...response.data
    })

  } catch (error) {
    console.error('Error in expire-bookings cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
