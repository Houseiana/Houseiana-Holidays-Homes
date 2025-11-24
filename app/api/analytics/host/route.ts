import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get authenticated user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // In production, verify JWT token here
    // For now, using simple token lookup from User table
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token },
          // Allow auth by email for testing
          { email: token }
        ]
      }
    });

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Helper to calculate date ranges
function getDateRanges() {
  const now = new Date();

  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Previous month for MoM comparison
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Rolling 30 days
  const rolling30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Last 7 periods (weeks for trend)
  const periods = [];
  for (let i = 6; i >= 0; i--) {
    const periodEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    periods.push({ start: periodStart, end: periodEnd });
  }

  return {
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
    rolling30Start,
    now,
    periods
  };
}

// Calculate number of nights between two dates
function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a host
    if (user.role !== 'HOST') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Host account required.' },
        { status: 403 }
      );
    }

    const dates = getDateRanges();

    // Get all host's properties
    const properties = await prisma.property.findMany({
      where: { hostId: user.id },
      select: { id: true }
    });

    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      // No properties, return zero values
      return NextResponse.json({
        success: true,
        data: {
          mtdRevenue: 0,
          mtdRevenueMoM: 0,
          occupancy: 0,
          adr: 0,
          bookings: 0,
          revenueTrend: [0, 0, 0, 0, 0, 0, 0],
          occupancyTrend: [0, 0, 0, 0, 0, 0, 0],
          topMarkets: []
        }
      });
    }

    // 1. MTD Revenue (Month-to-Date)
    const currentMonthBookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkIn: {
          gte: dates.currentMonthStart,
          lte: dates.currentMonthEnd
        }
      },
      select: {
        totalAmount: true,
        hostEarnings: true
      }
    });

    const mtdRevenue = currentMonthBookings.reduce(
      (sum, booking) => sum + (booking.hostEarnings || booking.totalAmount * 0.85),
      0
    );

    // Previous month revenue for MoM comparison
    const previousMonthBookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkIn: {
          gte: dates.previousMonthStart,
          lte: dates.previousMonthEnd
        }
      },
      select: {
        totalAmount: true,
        hostEarnings: true
      }
    });

    const previousMonthRevenue = previousMonthBookings.reduce(
      (sum, booking) => sum + (booking.hostEarnings || booking.totalAmount * 0.85),
      0
    );

    const mtdRevenueMoM = previousMonthRevenue > 0
      ? ((mtdRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    // 2. Bookings count (current month)
    const bookingsCount = currentMonthBookings.length;

    // 3. Occupancy (rolling 30 days)
    const rolling30Bookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        OR: [
          {
            checkIn: { gte: dates.rolling30Start, lte: dates.now }
          },
          {
            checkOut: { gte: dates.rolling30Start, lte: dates.now }
          },
          {
            AND: [
              { checkIn: { lte: dates.rolling30Start } },
              { checkOut: { gte: dates.now } }
            ]
          }
        ]
      },
      select: {
        checkIn: true,
        checkOut: true
      }
    });

    // Calculate booked nights in rolling 30 days
    let bookedNights = 0;
    rolling30Bookings.forEach(booking => {
      const effectiveStart = booking.checkIn < dates.rolling30Start
        ? dates.rolling30Start
        : booking.checkIn;
      const effectiveEnd = booking.checkOut > dates.now
        ? dates.now
        : booking.checkOut;

      bookedNights += calculateNights(effectiveStart, effectiveEnd);
    });

    const totalAvailableNights = 30 * propertyIds.length;
    const occupancy = totalAvailableNights > 0
      ? (bookedNights / totalAvailableNights) * 100
      : 0;

    // 4. ADR (Average Daily Rate) - current month
    const totalNightsCurrentMonth = currentMonthBookings.reduce((sum, booking) => {
      // For simplicity, estimate from totalAmount and average rate
      return sum + calculateNights(
        new Date(booking.totalAmount), // placeholder, need actual dates
        new Date(booking.totalAmount)
      );
    }, 0);

    // Get more detailed booking data for ADR
    const currentMonthBookingsDetailed = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkIn: {
          gte: dates.currentMonthStart,
          lte: dates.currentMonthEnd
        }
      },
      select: {
        checkIn: true,
        checkOut: true,
        totalAmount: true,
        hostEarnings: true
      }
    });

    let totalNights = 0;
    let totalRevenue = 0;

    currentMonthBookingsDetailed.forEach(booking => {
      const nights = calculateNights(booking.checkIn, booking.checkOut);
      totalNights += nights;
      totalRevenue += (booking.hostEarnings || booking.totalAmount * 0.85);
    });

    const adr = totalNights > 0 ? totalRevenue / totalNights : 0;

    // 5. Revenue Trend (last 7 weeks)
    const revenueTrend: number[] = [];
    const occupancyTrend: number[] = [];

    for (const period of dates.periods) {
      const periodBookings = await prisma.booking.findMany({
        where: {
          propertyId: { in: propertyIds },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          checkIn: {
            gte: period.start,
            lte: period.end
          }
        },
        select: {
          totalAmount: true,
          hostEarnings: true,
          checkIn: true,
          checkOut: true
        }
      });

      const periodRevenue = periodBookings.reduce(
        (sum, booking) => sum + (booking.hostEarnings || booking.totalAmount * 0.85),
        0
      );
      revenueTrend.push(Math.round(periodRevenue));

      // Calculate occupancy for this period
      let periodBookedNights = 0;
      periodBookings.forEach(booking => {
        const effectiveStart = booking.checkIn < period.start ? period.start : booking.checkIn;
        const effectiveEnd = booking.checkOut > period.end ? period.end : booking.checkOut;
        periodBookedNights += calculateNights(effectiveStart, effectiveEnd);
      });

      const periodDays = calculateNights(period.start, period.end);
      const periodTotalNights = periodDays * propertyIds.length;
      const periodOccupancy = periodTotalNights > 0
        ? (periodBookedNights / periodTotalNights) * 100
        : 0;
      occupancyTrend.push(Math.round(periodOccupancy * 100) / 100);
    }

    // 6. Top Markets (by city/country)
    const allBookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkIn: {
          gte: dates.rolling30Start
        }
      },
      include: {
        user: {
          select: {
            id: true
          }
        },
        property: {
          select: {
            city: true,
            country: true
          }
        }
      }
    });

    // Group by market (city)
    const marketMap = new Map<string, number>();
    allBookings.forEach(booking => {
      const market = booking.property.city || booking.property.country || 'Unknown';
      marketMap.set(market, (marketMap.get(market) || 0) + 1);
    });

    const totalBookingsForShare = allBookings.length;
    const topMarketsData = Array.from(marketMap.entries())
      .map(([name, count]) => ({
        name,
        share: totalBookingsForShare > 0
          ? Math.round((count / totalBookingsForShare) * 100 * 100) / 100
          : 0
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 3);

    // Return analytics data
    return NextResponse.json({
      success: true,
      data: {
        mtdRevenue: Math.round(mtdRevenue * 100) / 100,
        mtdRevenueMoM: Math.round(mtdRevenueMoM * 100) / 100,
        occupancy: Math.round(occupancy * 100) / 100,
        adr: Math.round(adr * 100) / 100,
        bookings: bookingsCount,
        revenueTrend,
        occupancyTrend,
        topMarkets: topMarketsData
      }
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
