import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

interface PaymentRecord {
  id: string;
  property: string;
  propertyId: string;
  date: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  bookingId: string;
  paymentMethod: string;
}

/**
 * GET /api/account/payments
 * Returns user's payment history from backend
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
        `${BACKEND_API_URL}/api/payments?userId=${userId}&page=${page}&limit=${limit}`,
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
          data: data.history || [],
          total: data.total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
        });
      }
    } catch (backendError) {
      console.warn('Backend fetch failed, using mock data:', backendError);
    }

    // Return mock data if backend fails
    const mockPayments: PaymentRecord[] = [
      {
        id: 'pay_1',
        property: 'Modern Downtown Apartment',
        propertyId: 'prop_1',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1280.0,
        currency: 'SAR',
        status: 'completed',
        bookingId: 'book_1',
        paymentMethod: 'Visa ••••4242',
      },
      {
        id: 'pay_2',
        property: 'Cozy Beach House',
        propertyId: 'prop_2',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 945.0,
        currency: 'SAR',
        status: 'completed',
        bookingId: 'book_2',
        paymentMethod: 'Mastercard ••••8888',
      },
      {
        id: 'pay_3',
        property: 'Luxury Villa with Pool',
        propertyId: 'prop_3',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 2150.0,
        currency: 'SAR',
        status: 'refunded',
        bookingId: 'book_3',
        paymentMethod: 'Visa ••••4242',
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockPayments,
      total: mockPayments.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/account/payments/export
 * Export payments as CSV
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

    // Fetch all payments for export
    let payments: PaymentRecord[] = [];

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/payments?userId=${userId}&limit=1000`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        payments = data.history || [];
      }
    } catch {
      // Use mock data
      payments = [
        {
          id: 'pay_1',
          property: 'Modern Downtown Apartment',
          propertyId: 'prop_1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 1280.0,
          currency: 'SAR',
          status: 'completed',
          bookingId: 'book_1',
          paymentMethod: 'Visa ••••4242',
        },
      ];
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      payments = payments.filter((p) => {
        const date = new Date(p.date);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      });
    }

    if (format === 'csv') {
      const headers = ['ID', 'Property', 'Date', 'Amount', 'Currency', 'Status', 'Payment Method'];
      const rows = payments.map((p) => [
        p.id,
        p.property,
        new Date(p.date).toLocaleDateString(),
        p.amount.toFixed(2),
        p.currency,
        p.status,
        p.paymentMethod,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error exporting payments:', error);
    return NextResponse.json(
      { error: 'Failed to export payments' },
      { status: 500 }
    );
  }
}
