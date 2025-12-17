import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiry: string;
  isDefault: boolean;
  cardholderName: string;
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

/**
 * GET /api/account/payment-methods
 * Returns user's saved payment methods
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
    const paymentMethods: PaymentMethod[] = metadata.paymentMethods || [];

    return NextResponse.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/payment-methods
 * Adds a new payment method
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
    const { cardNumber, expiry, cardholderName, billingAddress, isDefault } = body;

    // Validate required fields
    if (!cardNumber || !expiry || !cardholderName) {
      return NextResponse.json(
        { error: 'Card number, expiry, and cardholder name are required' },
        { status: 400 }
      );
    }

    // Detect card type from card number
    const getCardType = (number: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
      const cleaned = number.replace(/\s/g, '');
      if (cleaned.startsWith('4')) return 'visa';
      if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
      if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'amex';
      if (cleaned.startsWith('6')) return 'discover';
      return 'visa'; // Default
    };

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const existingMethods: PaymentMethod[] = metadata.paymentMethods || [];

    // Create new payment method
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: getCardType(cardNumber),
      last4: cardNumber.replace(/\s/g, '').slice(-4),
      expiry,
      cardholderName,
      billingAddress,
      isDefault: isDefault || existingMethods.length === 0,
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
        paymentMethods: updatedMethods,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
      data: newMethod,
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/payment-methods?id=xxx
 * Deletes a payment method
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
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const existingMethods: PaymentMethod[] = metadata.paymentMethods || [];

    const methodToDelete = existingMethods.find((m) => m.id === methodId);
    if (!methodToDelete) {
      return NextResponse.json(
        { error: 'Payment method not found' },
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
        paymentMethods: updatedMethods,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/payment-methods
 * Updates a payment method (e.g., set as default)
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
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const existingMethods: PaymentMethod[] = metadata.paymentMethods || [];

    const methodIndex = existingMethods.findIndex((m) => m.id === id);
    if (methodIndex === -1) {
      return NextResponse.json(
        { error: 'Payment method not found' },
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
        paymentMethods: updatedMethods,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}
