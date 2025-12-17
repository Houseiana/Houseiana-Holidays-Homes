import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth, clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/me
 * Fetches the current user's complete profile with stats
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

    // Get Clerk user for latest info
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        guestProfile: true,
        hostProfile: true,
        hostSettings: true,
        favorites: true,
        bookingsAsGuest: {
          where: {
            status: {
              in: ['CONFIRMED', 'COMPLETED', 'CHECKED_IN'],
            },
          },
        },
        propertiesAsHost: {
          where: {
            isActive: true,
            deleted_at: null,
          },
        },
        reviews: true,
        paymentMethods: true,
        payoutMethods: true,
      },
    });

    // If user doesn't exist in DB, create them
    if (!user) {
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      );

      user = await prisma.user.create({
        data: {
          clerkId,
          email: primaryEmail?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          profilePhoto: clerkUser.imageUrl,
          emailVerified: primaryEmail?.verification?.status === 'verified',
          isGuest: true,
          isHost: false,
        },
        include: {
          guestProfile: true,
          hostProfile: true,
          hostSettings: true,
          favorites: true,
          bookingsAsGuest: true,
          propertiesAsHost: true,
          reviews: true,
          paymentMethods: true,
          payoutMethods: true,
        },
      });

      // Create guest profile
      await prisma.guestProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Calculate stats
    const guestStats = {
      totalTrips: user.bookingsAsGuest.filter((b) => b.status === 'COMPLETED').length,
      upcomingTrips: user.bookingsAsGuest.filter(
        (b) => b.status === 'CONFIRMED' && new Date(b.checkIn) > new Date()
      ).length,
      totalSpent: user.bookingsAsGuest.reduce((sum, b) => sum + b.totalPrice, 0),
      travelPoints: user.guestProfile?.travelPoints || 0,
      loyaltyTier: user.guestProfile?.loyaltyTier || 'BRONZE',
      savedProperties: user.favorites.length,
      reviewsWritten: user.reviews.length,
    };

    const hostStats = user.isHost
      ? {
          totalEarnings: user.hostProfile?.totalRevenue || 0,
          pendingPayouts: 0, // Would need to calculate from payouts table
          activeListings: user.propertiesAsHost.filter((p) => p.status === 'PUBLISHED').length,
          totalListings: user.propertiesAsHost.length,
          upcomingReservations: 0, // Would need to calculate from bookings
          responseRate: user.hostProfile?.responseRate || 0,
          averageRating: user.hostProfile?.averageRating || 0,
          totalReviews: user.hostProfile?.totalReviews || 0,
          superHostStatus: user.hostProfile?.isVerifiedHost || false,
        }
      : null;

    // Build verifications
    const verifications = [
      {
        type: 'identity',
        status: user.kycStatus === 'APPROVED' ? 'verified' : user.kycStatus === 'PENDING' ? 'pending' : 'not_verified',
        verifiedAt: user.kycVerifiedAt?.toISOString(),
      },
      {
        type: 'email',
        status: user.emailVerified ? 'verified' : 'not_verified',
      },
      {
        type: 'phone',
        status: user.phoneVerified ? 'verified' : 'not_verified',
      },
      {
        type: 'government_id',
        status: user.qidNumber || user.passportNumber ? 'verified' : 'not_verified',
      },
    ];

    // Response
    const profile = {
      id: user.id,
      clerkId: user.clerkId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto || clerkUser.imageUrl,
      nationality: user.nationality,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
      birthDate: user.birthDate?.toISOString(),

      // Role info
      isGuest: user.isGuest,
      isHost: user.isHost,
      isAdmin: user.isAdmin,

      // Verification status
      kycStatus: user.kycStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      verifications,

      // Member info
      memberSince: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),

      // Stats
      guestStats,
      hostStats,

      // Guest profile data
      guestProfile: user.guestProfile
        ? {
            travelPurpose: user.guestProfile.travelPurpose,
            favoriteDestinations: user.guestProfile.favoriteDestinations,
            loyaltyTier: user.guestProfile.loyaltyTier,
            travelPoints: user.guestProfile.travelPoints,
            emailNotifications: user.guestProfile.emailNotifications,
            smsNotifications: user.guestProfile.smsNotifications,
            pushNotifications: user.guestProfile.pushNotifications,
          }
        : null,

      // Host profile data
      hostProfile: user.hostProfile
        ? {
            hostType: user.hostProfile.hostType,
            businessName: user.hostProfile.businessName,
            businessDescription: user.hostProfile.businessDescription,
            isVerifiedHost: user.hostProfile.isVerifiedHost,
            verificationLevel: user.hostProfile.verificationLevel,
            responseRate: user.hostProfile.responseRate,
            responseTime: user.hostProfile.responseTime,
            autoAcceptBookings: user.hostProfile.autoAcceptBookings,
            instantBookEnabled: user.hostProfile.instantBookEnabled,
          }
        : null,

      // Payment info summary
      hasPaymentMethods: user.paymentMethods.length > 0,
      hasPayoutMethods: user.payoutMethods.length > 0,
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
    const {
      firstName,
      lastName,
      phone,
      nationality,
      preferredLanguage,
      preferredCurrency,
      birthDate,
      profilePhoto,
    } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(nationality && { nationality }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(preferredCurrency && { preferredCurrency }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(profilePhoto && { profilePhoto }),
        updatedAt: new Date(),
      },
    });

    // Also update Clerk if name changed
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
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
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
