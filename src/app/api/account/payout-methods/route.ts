import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal';
  bankName?: string;
  paypalEmail?: string;
  last4: string;
  currency: string;
  country: string;
  accountHolderName: string;
  iban?: string;
  isDefault: boolean;
  status: 'ready' | 'pending' | 'failed';
  createdAt: string;
}

/**
 * GET /api/account/payout-methods
 * Returns user's saved payout methods
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const payoutMethods: PayoutMethod[] = metadata.payoutMethods || [];

    return NextResponse.json({
      success: true,
      data: payoutMethods,
    });
  } catch (error) {
    console.error('Error fetching payout methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout methods' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/payout-methods
 * Adds a new payout method
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
    const { payoutType, country, accountHolderName, iban, paypalEmail, isDefault } = body;

    // Validate required fields
    if (!payoutType || !accountHolderName || !country) {
      return NextResponse.json(
        { error: 'Payout type, account holder name, and country are required' },
        { status: 400 }
      );
    }

    if (payoutType === 'bank' && !iban) {
      return NextResponse.json(
        { error: 'IBAN is required for bank accounts' },
        { status: 400 }
      );
    }

    if (payoutType === 'paypal' && !paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required' },
        { status: 400 }
      );
    }

    // Get bank name from IBAN country code
    const getBankName = (iban: string, countryCode: string): string => {
      const bankNames: Record<string, string> = {
        SA: 'Saudi Bank',
        QA: 'Qatar Bank',
        AE: 'UAE Bank',
        KW: 'Kuwait Bank',
        BH: 'Bahrain Bank',
        OM: 'Oman Bank',
      };
      return bankNames[countryCode] || 'Bank Account';
    };

    // Get currency from country
    const getCurrency = (countryCode: string): string => {
      const currencies: Record<string, string> = {
        SA: 'SAR',
        QA: 'QAR',
        AE: 'AED',
        KW: 'KWD',
        BH: 'BHD',
        OM: 'OMR',
        US: 'USD',
        GB: 'GBP',
        EU: 'EUR',
      };
      return currencies[countryCode] || 'USD';
    };

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const existingMethods: PayoutMethod[] = metadata.payoutMethods || [];

    // Create new payout method
    const newMethod: PayoutMethod = {
      id: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: payoutType,
      bankName: payoutType === 'bank' ? getBankName(iban, country) : undefined,
      paypalEmail: payoutType === 'paypal' ? paypalEmail : undefined,
      last4: payoutType === 'bank' ? iban.replace(/\s/g, '').slice(-4) : paypalEmail.slice(-4),
      currency: getCurrency(country),
      country,
      accountHolderName,
      iban: payoutType === 'bank' ? iban : undefined,
      isDefault: isDefault || existingMethods.length === 0,
      status: 'pending', // Will be verified
      createdAt: new Date().toISOString(),
    };

    // If setting as default, unset others
    let updatedMethods = existingMethods;
    if (newMethod.isDefault) {
      updatedMethods = existingMethods.map((m) => ({ ...m, isDefault: false }));
    }

    updatedMethods.push(newMethod);

    // Save to Clerk metadata
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        payoutMethods: updatedMethods,
      },
    });

    // Simulate verification (in production, this would be async)
    setTimeout(async () => {
      try {
        const refreshedUser = await clerk.users.getUser(userId);
        const refreshedMetadata = (refreshedUser.publicMetadata || {}) as Record<string, any>;
        const methods: PayoutMethod[] = refreshedMetadata.payoutMethods || [];
        const updatedWithStatus = methods.map((m) =>
          m.id === newMethod.id ? { ...m, status: 'ready' as const } : m
        );
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...refreshedMetadata,
            payoutMethods: updatedWithStatus,
          },
        });
      } catch (e) {
        console.error('Error updating payout status:', e);
      }
    }, 3000);

    return NextResponse.json({
      success: true,
      message: 'Payout method added successfully. Verification in progress.',
      data: newMethod,
    });
  } catch (error) {
    console.error('Error adding payout method:', error);
    return NextResponse.json(
      { error: 'Failed to add payout method' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/payout-methods?id=xxx
 * Deletes a payout method
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const methodId = searchParams.get('id');

    if (!methodId) {
      return NextResponse.json(
        { error: 'Payout method ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const existingMethods: PayoutMethod[] = metadata.payoutMethods || [];

    const methodToDelete = existingMethods.find((m) => m.id === methodId);
    if (!methodToDelete) {
      return NextResponse.json(
        { error: 'Payout method not found' },
        { status: 404 }
      );
    }

    let updatedMethods = existingMethods.filter((m) => m.id !== methodId);

    // If deleted method was default, make first remaining method default
    if (methodToDelete.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        payoutMethods: updatedMethods,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payout method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payout method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payout method' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/payout-methods
 * Updates a payout method (e.g., set as default)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, setDefault } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Payout method ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const existingMethods: PayoutMethod[] = metadata.payoutMethods || [];

    const methodIndex = existingMethods.findIndex((m) => m.id === id);
    if (methodIndex === -1) {
      return NextResponse.json(
        { error: 'Payout method not found' },
        { status: 404 }
      );
    }

    let updatedMethods = existingMethods;

    if (setDefault) {
      updatedMethods = existingMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }));
    }

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        payoutMethods: updatedMethods,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payout method updated successfully',
    });
  } catch (error) {
    console.error('Error updating payout method:', error);
    return NextResponse.json(
      { error: 'Failed to update payout method' },
      { status: 500 }
    );
  }
}
