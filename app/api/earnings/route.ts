import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/earnings - Get host earnings and payouts
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

    // Get month-to-date bookings for this host
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const mtdBookings = await (prisma as any).booking.findMany({
      where: {
        hostId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkIn: {
          gte: monthStart,
          lte: monthEnd,
        }
      },
      select: {
        id: true,
        totalPrice: true,
        hostEarnings: true,
        numberOfNights: true,
        status: true,
      }
    })

    // Calculate MTD metrics
    const mtdRevenue = mtdBookings.reduce((sum, b) => sum + (b.hostEarnings || b.totalPrice * 0.85 || 0), 0)
    const totalNights = mtdBookings.reduce((sum, b) => sum + (b.numberOfNights || 0), 0)
    const adr = totalNights > 0 ? mtdRevenue / totalNights : 0

    // Calculate occupancy for this month
    const hostProperties = await (prisma as any).property.findMany({
      where: {
        ownerId: hostId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
      }
    })

    const totalAvailableNights = hostProperties.length * now.getDate() // Properties * days in month so far
    const occupancy = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0

    // Get upcoming and recent payouts
    const payouts = await (prisma as any).payout.findMany({
      where: {
        hostId,
      },
      orderBy: {
        scheduledDate: 'desc',
      },
      take: 20,
    })

    // Transform payouts for frontend
    const payoutsData = payouts.map((payout: any) => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status,
      date: payout.paidDate?.toISOString?.() || payout.scheduledDate?.toISOString?.() || payout.createdAt?.toISOString?.(),
      scheduledDate: payout.scheduledDate?.toISOString?.(),
      paidDate: payout.paidDate?.toISOString?.(),
      method: payout.method || 'Bank Transfer',
      currency: payout.currency || 'QAR',
      periodStart: payout.periodStart?.toISOString?.(),
      periodEnd: payout.periodEnd?.toISOString?.(),
    }))

    // Find upcoming payout
    const upcomingPayout = payouts.find((p: any) =>
      p.status === 'SCHEDULED' && new Date(p.scheduledDate) > now
    )

    return NextResponse.json({
      success: true,
      metrics: {
        mtdRevenue: Math.round(mtdRevenue * 100) / 100,
        adr: Math.round(adr * 100) / 100,
        occupancy: Math.round(occupancy * 10) / 10,
        totalBookings: mtdBookings.length,
      },
      upcomingPayout: upcomingPayout ? {
        amount: upcomingPayout.amount,
        date: upcomingPayout.scheduledDate?.toISOString?.(),
        method: upcomingPayout.method || 'Bank Transfer',
      } : null,
      payouts: payoutsData,
    })

  } catch (error) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
