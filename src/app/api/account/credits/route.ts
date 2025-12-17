import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  currency: string;
  balance: number;
  redeemedAt: string;
  expiresAt?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  currency?: string;
  description: string;
  appliedAt: string;
  expiresAt?: string;
  minPurchase?: number;
  used: boolean;
}

interface CreditsData {
  balance: number;
  currency: string;
  giftCards: GiftCard[];
  coupons: Coupon[];
}

/**
 * GET /api/account/credits
 * Returns user's credits, gift cards, and coupons
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

    const creditsData: CreditsData = {
      balance: metadata.creditBalance || 0,
      currency: metadata.creditCurrency || 'SAR',
      giftCards: metadata.giftCards || [],
      coupons: metadata.coupons || [],
    };

    return NextResponse.json({
      success: true,
      data: creditsData,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/credits
 * Redeem a gift card or add a coupon
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
    const { type, code } = body;

    if (!type || !code) {
      return NextResponse.json(
        { error: 'Type and code are required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    if (type === 'giftcard') {
      // Validate gift card code (in production, validate against backend)
      const giftCardPatterns: Record<string, { amount: number; currency: string }> = {
        'GIFT100': { amount: 100, currency: 'SAR' },
        'GIFT200': { amount: 200, currency: 'SAR' },
        'GIFT500': { amount: 500, currency: 'SAR' },
        'WELCOME50': { amount: 50, currency: 'SAR' },
      };

      const giftCardInfo = giftCardPatterns[code.toUpperCase()];
      if (!giftCardInfo) {
        return NextResponse.json(
          { error: 'Invalid gift card code' },
          { status: 400 }
        );
      }

      // Check if already redeemed
      const existingGiftCards: GiftCard[] = metadata.giftCards || [];
      if (existingGiftCards.some((gc) => gc.code === code.toUpperCase())) {
        return NextResponse.json(
          { error: 'Gift card has already been redeemed' },
          { status: 400 }
        );
      }

      const newGiftCard: GiftCard = {
        id: `gc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        code: code.toUpperCase(),
        amount: giftCardInfo.amount,
        currency: giftCardInfo.currency,
        balance: giftCardInfo.amount,
        redeemedAt: new Date().toISOString(),
      };

      const newBalance = (metadata.creditBalance || 0) + giftCardInfo.amount;

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...metadata,
          creditBalance: newBalance,
          creditCurrency: giftCardInfo.currency,
          giftCards: [...existingGiftCards, newGiftCard],
        },
      });

      return NextResponse.json({
        success: true,
        message: `Gift card redeemed! ${giftCardInfo.amount} ${giftCardInfo.currency} added to your balance.`,
        data: {
          giftCard: newGiftCard,
          newBalance,
        },
      });
    }

    if (type === 'coupon') {
      // Validate coupon code (in production, validate against backend)
      const couponPatterns: Record<string, { discount: number; discountType: 'percentage' | 'fixed'; description: string; minPurchase?: number }> = {
        'SAVE10': { discount: 10, discountType: 'percentage', description: '10% off your next booking' },
        'SAVE20': { discount: 20, discountType: 'percentage', description: '20% off your next booking', minPurchase: 500 },
        'FLAT50': { discount: 50, discountType: 'fixed', description: 'SAR 50 off your next booking' },
        'FLAT100': { discount: 100, discountType: 'fixed', description: 'SAR 100 off your next booking', minPurchase: 300 },
        'NEWUSER': { discount: 15, discountType: 'percentage', description: '15% off for new users' },
      };

      const couponInfo = couponPatterns[code.toUpperCase()];
      if (!couponInfo) {
        return NextResponse.json(
          { error: 'Invalid coupon code' },
          { status: 400 }
        );
      }

      // Check if already added
      const existingCoupons: Coupon[] = metadata.coupons || [];
      if (existingCoupons.some((c) => c.code === code.toUpperCase())) {
        return NextResponse.json(
          { error: 'Coupon has already been added' },
          { status: 400 }
        );
      }

      const newCoupon: Coupon = {
        id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        code: code.toUpperCase(),
        discount: couponInfo.discount,
        discountType: couponInfo.discountType,
        currency: couponInfo.discountType === 'fixed' ? 'SAR' : undefined,
        description: couponInfo.description,
        appliedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        minPurchase: couponInfo.minPurchase,
        used: false,
      };

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...metadata,
          coupons: [...existingCoupons, newCoupon],
        },
      });

      return NextResponse.json({
        success: true,
        message: `Coupon added! ${couponInfo.description}`,
        data: {
          coupon: newCoupon,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid type. Must be "giftcard" or "coupon"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing credits:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/credits?type=coupon&id=xxx
 * Remove a coupon
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
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    if (type === 'coupon') {
      const existingCoupons: Coupon[] = metadata.coupons || [];
      const updatedCoupons = existingCoupons.filter((c) => c.id !== id);

      if (existingCoupons.length === updatedCoupons.length) {
        return NextResponse.json(
          { error: 'Coupon not found' },
          { status: 404 }
        );
      }

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...metadata,
          coupons: updatedCoupons,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Coupon removed successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error removing item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
