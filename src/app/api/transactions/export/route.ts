/**
 * Transactions Export API
 * Export transaction history as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/transactions/export
 * Export transactions as CSV
 * Query params: status, type, startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = { userId: user.id };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Generate CSV
    const headers = ['Date', 'Description', 'Payment Method', 'Status', 'Type', 'Amount'];
    const csvRows = [headers.join(',')];

    transactions.forEach(txn => {
      const row = [
        new Date(txn.date).toLocaleDateString('en-US'),
        `"${txn.description}"`, // Quote to handle commas in description
        txn.paymentMethod,
        txn.status,
        txn.type,
        txn.amount.toFixed(2)
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}
