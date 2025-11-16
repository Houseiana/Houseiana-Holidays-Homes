/**
 * User Dashboard API Route (v2 - Using OOP Architecture)
 * Get dashboard data for host or guest
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserService } from '@/infrastructure/di/Container';

/**
 * GET /api/v2/users/[id]/dashboard?role=host|guest
 * Get user dashboard data based on role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    const userService = getUserService();

    if (role === 'host') {
      const dashboardData = await userService.getHostDashboard(params.id);

      return NextResponse.json({
        success: true,
        data: {
          user: dashboardData.user.toJSON(),
          properties: dashboardData.properties,
          publishedProperties: dashboardData.publishedProperties,
          totalBookings: dashboardData.totalBookings,
          pendingBookings: dashboardData.pendingBookings,
          upcomingBookings: dashboardData.upcomingBookings,
          totalEarnings: dashboardData.totalEarnings,
          averageRating: dashboardData.averageRating,
        },
      });

    } else if (role === 'guest') {
      const dashboardData = await userService.getGuestDashboard(params.id);

      return NextResponse.json({
        success: true,
        data: {
          user: dashboardData.user.toJSON(),
          upcomingTrips: dashboardData.upcomingTrips,
          currentTrips: dashboardData.currentTrips,
          pastTrips: dashboardData.pastTrips,
          favoriteProperties: dashboardData.favoriteProperties,
        },
      });

    } else {
      // Get general user stats
      const stats = await userService.getUserStats(params.id);

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data'
      },
      { status: 500 }
    );
  }
}
