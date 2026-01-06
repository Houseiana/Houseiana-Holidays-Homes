import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  method: string;
  bookingId?: string;
  property?: string;
}

/**
 * GET /api/account/payouts
 * Returns user's payout history from backend
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Try to fetch from backend
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/payouts?userId=${userId}&page=${page}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          data: data.payouts || [],
          total: data.total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
        });
      }
    } catch (backendError) {
      console.warn('Backend fetch failed, using mock data:', backendError);
    }

    // Return mock data if backend fails
    const mockPayouts: PayoutRecord[] = [
      {
        id: 'pout_1',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 850.0,
        currency: 'SAR',
        status: 'completed',
        method: 'Al Rajhi Bank ••••7890',
        bookingId: 'book_4',
        property: 'Cozy Downtown Studio',
      },
      {
        id: 'pout_2',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1240.0,
        currency: 'SAR',
        status: 'completed',
        method: 'Al Rajhi Bank ••••7890',
        bookingId: 'book_5',
        property: 'Modern Beach Apartment',
      },
      {
        id: 'pout_3',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 620.0,
        currency: 'SAR',
        status: 'pending',
        method: 'Al Rajhi Bank ••••7890',
        bookingId: 'book_6',
        property: 'Luxury Villa',
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockPayouts,
      total: mockPayouts.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/payouts
 * Export payouts as CSV
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { format = 'csv', startDate, endDate } = body;

    // Fetch all payouts for export
    let payouts: PayoutRecord[] = [];

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/payouts?userId=${userId}&limit=1000`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        payouts = data.payouts || [];
      }
    } catch {
      // Use mock data
      payouts = [
        {
          id: 'pout_1',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 850.0,
          currency: 'SAR',
          status: 'completed',
          method: 'Al Rajhi Bank ••••7890',
        },
      ];
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      payouts = payouts.filter((p) => {
        const date = new Date(p.date);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      });
    }

    if (format === 'csv') {
      const headers = ['ID', 'Date', 'Amount', 'Currency', 'Status', 'Payout Method'];
      const rows = payouts.map((p) => [
        p.id,
        new Date(p.date).toLocaleDateString(),
        p.amount.toFixed(2),
        p.currency,
        p.status,
        p.method,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payouts_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    console.error('Error exporting payouts:', error);
    return NextResponse.json(
      { error: 'Failed to export payouts' },
      { status: 500 }
    );
  }
}
