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

// Helper to get default payout method string
async function getDefaultPayoutMethodString(userId: string): Promise<string> {
  try {
    const defaultMethod = await prisma.payoutMethod.findFirst({
      where: {
        userId,
        isDefault: true
      },
      select: {
        type: true,
        bankName: true,
        accountNumber: true,
        iban: true
      }
    });

    if (!defaultMethod) {
      return 'No payout method configured';
    }

    // Format the payout method string
    if (defaultMethod.type === 'BANK_TRANSFER') {
      if (defaultMethod.accountNumber) {
        const last4 = defaultMethod.accountNumber.slice(-4);
        const bankName = defaultMethod.bankName || 'Bank';
        return `${bankName} •••• ${last4}`;
      }
      if (defaultMethod.iban) {
        const last4 = defaultMethod.iban.slice(-4);
        return `IBAN •••• ${last4}`;
      }
    }

    return `${defaultMethod.type.replace('_', ' ')}`;
  } catch (error) {
    console.error('Error getting payout method:', error);
    return 'Bank •••• 1022'; // Fallback
  }
}

// GET /api/host/settings
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
    if (!user.isHost) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Host account required.' },
        { status: 403 }
      );
    }

    // Get or create host settings
    let settings = await prisma.hostSettings.findUnique({
      where: { userId: user.id }
    });

    // If no settings exist, create with defaults
    if (!settings) {
      const defaultPayoutMethod = await getDefaultPayoutMethodString(user.id);

      settings = await prisma.hostSettings.create({
        data: {
          userId: user.id,
          emailAlerts: true,
          smsAlerts: false,
          pushAlerts: true,
          autoPayouts: true,
          defaultPayoutMethod
        }
      });
    }

    // If defaultPayoutMethod is not set, get it
    if (!settings.defaultPayoutMethod) {
      settings.defaultPayoutMethod = await getDefaultPayoutMethodString(user.id);

      // Update the settings with the payout method
      await prisma.hostSettings.update({
        where: { id: settings.id },
        data: { defaultPayoutMethod: settings.defaultPayoutMethod }
      });
    }

    // Return settings in the expected format
    return NextResponse.json({
      success: true,
      data: {
        emailAlerts: settings.emailAlerts,
        smsAlerts: settings.smsAlerts,
        pushAlerts: settings.pushAlerts,
        autoPayouts: settings.autoPayouts,
        defaultPayoutMethod: settings.defaultPayoutMethod || 'Bank •••• 1022'
      }
    });

  } catch (error: any) {
    console.error('Host settings GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch host settings',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/host/settings (also handles PUT)
export async function POST(request: NextRequest) {
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
    if (!user.isHost) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Host account required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const updates: {
      emailAlerts?: boolean;
      smsAlerts?: boolean;
      pushAlerts?: boolean;
      autoPayouts?: boolean;
      defaultPayoutMethod?: string;
    } = {};

    if (typeof body.emailAlerts === 'boolean') {
      updates.emailAlerts = body.emailAlerts;
    }
    if (typeof body.smsAlerts === 'boolean') {
      updates.smsAlerts = body.smsAlerts;
    }
    if (typeof body.pushAlerts === 'boolean') {
      updates.pushAlerts = body.pushAlerts;
    }
    if (typeof body.autoPayouts === 'boolean') {
      updates.autoPayouts = body.autoPayouts;
    }
    if (typeof body.defaultPayoutMethod === 'string') {
      updates.defaultPayoutMethod = body.defaultPayoutMethod;
    }

    // Update or create settings
    const settings = await prisma.hostSettings.upsert({
      where: { userId: user.id },
      update: updates,
      create: {
        userId: user.id,
        emailAlerts: body.emailAlerts ?? true,
        smsAlerts: body.smsAlerts ?? false,
        pushAlerts: body.pushAlerts ?? true,
        autoPayouts: body.autoPayouts ?? true,
        defaultPayoutMethod: body.defaultPayoutMethod ?? await getDefaultPayoutMethodString(user.id)
      }
    });

    // Return updated settings
    return NextResponse.json({
      success: true,
      data: {
        emailAlerts: settings.emailAlerts,
        smsAlerts: settings.smsAlerts,
        pushAlerts: settings.pushAlerts,
        autoPayouts: settings.autoPayouts,
        defaultPayoutMethod: settings.defaultPayoutMethod || 'Bank •••• 1022'
      }
    });

  } catch (error: any) {
    console.error('Host settings POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update host settings',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT is an alias for POST
export async function PUT(request: NextRequest) {
  return POST(request);
}
