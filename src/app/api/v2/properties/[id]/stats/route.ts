/**
 * Property Statistics API Route (v2 - Using OOP Architecture)
 * Get statistics for a specific property
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPropertyService } from '@/infrastructure/di/Container';

/**
 * GET /api/v2/properties/[id]/stats
 * Get property statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('hostId');

    if (!hostId) {
      return NextResponse.json(
        { success: false, error: 'hostId query parameter is required' },
        { status: 400 }
      );
    }

    const propertyService = getPropertyService();
    const stats = await propertyService.getPropertyStats(params.id, hostId);

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error fetching property stats:', error);

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
        error: 'Failed to fetch property statistics'
      },
      { status: 500 }
    );
  }
}
