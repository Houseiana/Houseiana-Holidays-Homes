import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/users/[id]
 * Fetches a user's public profile
 * Can be viewed by guests (to see host profile) or hosts (to see guest profile)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: viewerId } = await auth();

    // Fetch user with related profiles
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: id },
          { clerkId: id },
        ],
      },
      include: {
        guestProfile: true,
        hostProfile: true,
        propertiesAsHost: {
          where: {
            status: 'PUBLISHED',
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            city: true,
            coverPhoto: true,
            pricePerNight: true,
            averageRating: true,
            bookingCount: true,
            total_reviews: true,
          },
          take: 6,
        },
        reviews: {
          where: {
            property: {
              ownerId: id,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          select: {
            id: true,
            overallRating: true,
            comment: true,
            createdAt: true,
            hostResponse: true,
            hostRespondedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            property: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build verification badges
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
    ];

    // Build trust indicators
    const trustIndicators = [];

    if (user.isHost && user.hostProfile) {
      if (user.hostProfile.responseRate && user.hostProfile.responseRate >= 90) {
        trustIndicators.push({
          label: 'Response Rate',
          value: `${Math.round(user.hostProfile.responseRate)}%`,
          description: 'Responds to most messages',
        });
      }

      if (user.hostProfile.responseTime && user.hostProfile.responseTime <= 60) {
        trustIndicators.push({
          label: 'Response Time',
          value: user.hostProfile.responseTime <= 30 ? 'Within an hour' : 'Within a few hours',
          description: 'Quick to respond',
        });
      }

      if (user.hostProfile.isVerifiedHost) {
        trustIndicators.push({
          label: 'Verified Host',
          value: 'Yes',
          description: 'Identity and property verified',
        });
      }
    }

    if (user.isGuest && user.guestProfile) {
      if (user.guestProfile.totalBookings >= 5) {
        trustIndicators.push({
          label: 'Experienced Traveler',
          value: `${user.guestProfile.totalBookings}+ trips`,
          description: 'Has traveled with Houseiana before',
        });
      }

      if (user.guestProfile.loyaltyTier !== 'BRONZE') {
        trustIndicators.push({
          label: 'Loyalty Member',
          value: user.guestProfile.loyaltyTier,
          description: `${user.guestProfile.loyaltyTier} tier member`,
        });
      }
    }

    // Calculate review summary
    const reviewSummary = {
      averageRating: user.hostProfile?.averageRating || user.guestProfile?.averageRating || 0,
      totalReviews: user.hostProfile?.totalReviews || 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    // Count ratings from reviews
    user.reviews.forEach((review: any) => {
      const rating = Math.round(review.overallRating);
      if (rating >= 1 && rating <= 5) {
        reviewSummary.ratingBreakdown[rating as keyof typeof reviewSummary.ratingBreakdown]++;
      }
    });

    // Format reviews
    const formattedReviews = user.reviews.map((review: any) => ({
      id: review.id,
      reviewerId: review.user.id,
      reviewerName: `${review.user.firstName} ${review.user.lastName}`.trim(),
      reviewerPhoto: review.user.profilePhoto,
      rating: review.overallRating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      propertyTitle: review.property?.title,
      response: review.hostResponse
        ? {
            content: review.hostResponse,
            respondedAt: review.hostRespondedAt?.toISOString(),
          }
        : undefined,
    }));

    // Format properties
    const properties = user.propertiesAsHost.map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      city: prop.city,
      coverPhoto: prop.coverPhoto,
      pricePerNight: prop.pricePerNight,
      averageRating: prop.averageRating,
      reviewCount: prop.total_reviews || 0,
    }));

    // Build public profile response
    const publicProfile = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        nationality: user.nationality,
        preferredLanguage: user.preferredLanguage,
        isGuest: user.isGuest,
        isHost: user.isHost,
        kycStatus: user.kycStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt.toISOString(),
      },
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
      memberSince: user.createdAt.toISOString(),
      location: user.nationality,
      verifications,
      trustIndicators,
      guestProfile: user.guestProfile
        ? {
            id: user.guestProfile.id,
            userId: user.guestProfile.userId,
            travelPurpose: user.guestProfile.travelPurpose,
            favoriteDestinations: user.guestProfile.favoriteDestinations,
            totalBookings: user.guestProfile.totalBookings,
            totalNightsStayed: user.guestProfile.totalNightsStayed,
            averageRating: user.guestProfile.averageRating,
            memberSince: user.guestProfile.createdAt.toISOString(),
            loyaltyTier: user.guestProfile.loyaltyTier,
          }
        : undefined,
      hostProfile: user.hostProfile
        ? {
            id: user.hostProfile.id,
            userId: user.hostProfile.userId,
            hostType: user.hostProfile.hostType,
            businessName: user.hostProfile.businessName,
            businessDescription: user.hostProfile.businessDescription,
            isVerifiedHost: user.hostProfile.isVerifiedHost,
            verifiedAt: user.hostProfile.verifiedAt?.toISOString(),
            verificationLevel: user.hostProfile.verificationLevel,
            totalProperties: user.hostProfile.totalProperties,
            activeProperties: user.hostProfile.activeProperties,
            totalBookings: user.hostProfile.totalBookings,
            averageRating: user.hostProfile.averageRating,
            totalReviews: user.hostProfile.totalReviews,
            responseRate: user.hostProfile.responseRate,
            responseTime: user.hostProfile.responseTime,
            acceptanceRate: user.hostProfile.acceptanceRate,
            cancellationRate: user.hostProfile.cancellationRate,
            autoAcceptBookings: user.hostProfile.autoAcceptBookings,
            instantBookEnabled: user.hostProfile.instantBookEnabled,
            memberSince: user.hostProfile.createdAt.toISOString(),
          }
        : undefined,
      reviews: {
        summary: reviewSummary,
        items: formattedReviews,
        hasMore: user.reviews.length >= 5,
      },
      properties,
    };

    return NextResponse.json({
      success: true,
      data: publicProfile,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
