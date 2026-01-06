import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/me
 * Fetches the current user's profile from Clerk
 * Database integration pending
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get Clerk user info
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);

    const primaryEmail = clerkUser.emailAddresses.find(
      (e: { id: string; emailAddress: string; verification?: { status: string } }) => e.id === clerkUser.primaryEmailAddressId
    );

    // Build profile from Clerk data
    const profile = {
      id: clerkId,
      clerkId: clerkId,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      email: primaryEmail?.emailAddress || '',
      profilePhoto: clerkUser.imageUrl,
      emailVerified: primaryEmail?.verification?.status === 'verified',

      // Role info (defaults - would come from database)
      isGuest: true,
      isHost: false,
      isAdmin: false,

      // Verification status
      kycStatus: 'NOT_STARTED',
      phoneVerified: false,
      verifications: [
        {
          type: 'email',
          status: primaryEmail?.verification?.status === 'verified' ? 'verified' : 'not_verified',
        },
        {
          type: 'phone',
          status: 'not_verified',
        },
        {
          type: 'identity',
          status: 'not_verified',
        },
      ],

      // Member info
      memberSince: clerkUser.createdAt,

      // Stats (defaults - would come from database)
      guestStats: {
        totalTrips: 0,
        upcomingTrips: 0,
        totalSpent: 0,
        travelPoints: 0,
        loyaltyTier: 'BRONZE',
        savedProperties: 0,
        reviewsWritten: 0,
      },
      hostStats: null,
      guestProfile: null,
      hostProfile: null,
      hasPaymentMethods: false,
      hasPayoutMethods: false,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error fetching current user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/me
 * Updates the current user's profile
 * Database integration pending
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName } = body;

    // Update Clerk user if name changed
    if (firstName || lastName) {
      const clerk = await clerkClient();
      await clerk.users.updateUser(clerkId, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: clerkId,
        firstName,
        lastName,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
