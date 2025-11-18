/**
 * Transactions API
 * Handles transaction history operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/transactions
 * Get all transactions for the authenticated user
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

    // Calculate summary statistics
    const summary = {
      totalSpent: transactions
        .filter(t => t.type === 'PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunds: transactions
        .filter(t => t.type === 'REFUND')
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length
    };

    return NextResponse.json({
      success: true,
      data: transactions,
      summary
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Create a new transaction (typically called after payment processing)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      bookingId,
      description,
      amount,
      status,
      type,
      paymentMethod,
      stripeChargeId,
      stripeRefundId
    } = body;

    // Validate required fields
    if (!description || !amount || !type || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        bookingId,
        description,
        amount,
        status: status || 'PAID',
        type: type.toUpperCase(),
        paymentMethod,
        stripeChargeId,
        stripeRefundId
      }
    });

    return NextResponse.json({
      success: true,
      data: transaction
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
