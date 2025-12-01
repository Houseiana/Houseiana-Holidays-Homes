import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'

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

    // Find all AWAITING_PAYMENT bookings with expired holds
    const expiredBookings = await (prisma as any).booking.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        holdExpiresAt: {
          lte: now // Hold expiry time is in the past
        }
      },
      select: {
        id: true,
        propertyId: true,
        checkIn: true,
        checkOut: true,
        holdExpiresAt: true,
        totalPrice: true,
        guest: {
          select: {
            email: true,
            firstName: true,
          }
        },
        property: {
          select: {
            title: true,
          }
        }
      }
    })

    if (expiredBookings.length === 0) {
      console.log('[Cleanup Cron] No expired bookings found')
      return NextResponse.json({
        success: true,
        message: 'No expired bookings to clean up',
        expiredCount: 0,
        timestamp: now.toISOString(),
      })
    }

    console.log(`[Cleanup Cron] Found ${expiredBookings.length} expired bookings`)

    // Update all expired bookings to EXPIRED status
    const updateResult = await (prisma as any).booking.updateMany({
      where: {
        id: {
          in: expiredBookings.map((b: any) => b.id)
        }
      },
      data: {
        status: 'EXPIRED',
        paymentStatus: 'FAILED', // Mark payment as failed
      }
    })

    console.log(`[Cleanup Cron] Updated ${updateResult.count} bookings to EXPIRED status`)

    // Log expired bookings for monitoring
    expiredBookings.forEach((booking: any) => {
      console.log(
        `[Cleanup Cron] Expired: ${booking.id} | ` +
        `Property: ${booking.property?.title} | ` +
        `Guest: ${booking.guest?.email} | ` +
        `Amount: $${booking.totalPrice} | ` +
        `Expired: ${booking.holdExpiresAt}`
      )
    })

    // Optional: Release availability dates back to calendar
    // This allows other guests to book these dates
    for (const booking of expiredBookings) {
      try {
        const datesToRelease = []
        const checkIn = new Date(booking.checkIn)
        const checkOut = new Date(booking.checkOut)

        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          datesToRelease.push(new Date(d))
        }

        if (datesToRelease.length > 0) {
          await (prisma as any).availability.updateMany({
            where: {
              propertyId: booking.propertyId,
              date: { in: datesToRelease }
            },
            data: {
              available: true
            }
          })

          console.log(
            `[Cleanup Cron] Released ${datesToRelease.length} dates for property ${booking.propertyId}`
          )
        }
      } catch (error) {
        console.error(`[Cleanup Cron] Failed to release dates for booking ${booking.id}:`, error)
        // Continue processing other bookings even if one fails
      }
    }

    // Optional: Send notification emails to guests (future enhancement)
    // You can integrate with your email service here
    // Example: await sendBookingExpiredEmail(booking.guest.email, booking)

    return NextResponse.json({
      success: true,
      message: `Successfully expired ${updateResult.count} bookings`,
      expiredCount: updateResult.count,
      timestamp: now.toISOString(),
      details: expiredBookings.map((b: any) => ({
        id: b.id,
        property: b.property?.title,
        guest: b.guest?.email,
        amount: b.totalPrice,
        expiredAt: b.holdExpiresAt,
      })),
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
