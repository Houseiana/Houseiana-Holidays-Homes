import { NextRequest, NextResponse } from 'next/server'
import { CronAPI } from '@/lib/backend-api'

/**
 * GET /api/cron/cleanup-bookings
 *
 * Automated cleanup job to expire bookings that are AWAITING_PAYMENT
 * but have passed their holdExpiresAt timestamp.
 *
 * This prevents "inventory freeze" DoS attacks where malicious users
 * create bookings but never pay, blocking legitimate bookings.
 *
 * Runs every 10 minutes via Vercel Cron Job
 *
 * Security:
 * - Protected by Vercel Cron Secret header verification
 * - Only callable by Vercel's cron system or with valid auth header
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn('Unauthorized cron job access attempt')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } else {
      console.warn('CRON_SECRET not configured - running in development mode')
    }

    const now = new Date()
    console.log(`[Cleanup Cron] Starting booking cleanup at ${now.toISOString()}`)

    // Backend handles all cleanup logic:
    // - Finding expired bookings
    // - Updating status to EXPIRED
    // - Releasing availability dates
    const response = await CronAPI.cleanupExpiredBookings(cronSecret)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json(
        {
          error: 'Failed to cleanup expired bookings',
          details: response.error,
        },
        { status: 500 }
      )
    }

    console.log(`[Cleanup Cron] Completed: ${response.data?.expiredCount || 0} bookings expired`)

    return NextResponse.json({
      success: true,
      ...response.data,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('[Cleanup Cron] Error during booking cleanup:', error)
    return NextResponse.json(
      {
        error: 'Failed to cleanup expired bookings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
