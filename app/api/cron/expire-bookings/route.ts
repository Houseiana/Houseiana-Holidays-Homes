import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'

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

    const now = new Date()

    // Find all bookings with expired holds
    const expiredBookings = await (prisma as any).booking.findMany({
      where: {
        holdExpiresAt: {
          lt: now
        },
        status: {
          in: ['REQUESTED', 'APPROVED', 'PENDING']
        },
        paymentStatus: {
          not: 'PAID'
        }
      },
      include: {
        property: {
          select: {
            id: true,
            title: true
          }
        },
        guest: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log(`Found ${expiredBookings.length} expired bookings`)

    const results = []

    // Process each expired booking
    for (const booking of expiredBookings) {
      try {
        // Update booking to EXPIRED status and release availability
        await (prisma as any).$transaction(async (tx: any) => {
          // Update booking status
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: 'EXPIRED',
              cancelledAt: now,
              cancelledBy: 'SYSTEM',
              cancellationReason: 'Payment hold expired'
            }
          })

          // Release availability dates
          const datesToRelease = []
          const checkIn = new Date(booking.checkIn)
          const checkOut = new Date(booking.checkOut)
          
          for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
            datesToRelease.push(new Date(d))
          }

          await tx.availability.updateMany({
            where: {
              propertyId: booking.propertyId,
              date: { in: datesToRelease }
            },
            data: {
              available: true
            }
          })
        })

        results.push({
          id: booking.id,
          propertyTitle: booking.property?.title,
          guestEmail: booking.guest?.email,
          status: 'expired'
        })

        console.log(`Expired booking ${booking.id} for ${booking.property?.title}`)

        // TODO: Send expiry notification to guest and host

      } catch (error) {
        console.error(`Error expiring booking ${booking.id}:`, error)
        results.push({
          id: booking.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiredBookings.length,
      results
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
