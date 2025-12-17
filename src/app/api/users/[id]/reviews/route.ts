import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/users/[id]/reviews
 * Fetches paginated reviews for a user (as host or guest)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role') || 'host'; // 'host' or 'guest'
    const skip = (page - 1) * limit;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: id }, { clerkId: id }],
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let reviews: any[] = [];
    let total = 0;

    if (role === 'host') {
      // Get reviews for properties owned by this user
      reviews = await prisma.review.findMany({
        where: {
          property: {
            ownerId: user.id,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          overallRating: true,
          cleanlinessRating: true,
          accuracyRating: true,
          checkInRating: true,
          communicationRating: true,
          locationRating: true,
          valueRating: true,
          comment: true,
          hostResponse: true,
          hostRespondedAt: true,
          createdAt: true,
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
              id: true,
              title: true,
              city: true,
            },
          },
        },
      });

      total = await prisma.review.count({
        where: {
          property: {
            ownerId: user.id,
          },
        },
      });
    } else {
      // Get reviews written by this user (as guest)
      reviews = await prisma.review.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          overallRating: true,
          cleanlinessRating: true,
          accuracyRating: true,
          checkInRating: true,
          communicationRating: true,
          locationRating: true,
          valueRating: true,
          comment: true,
          hostResponse: true,
          hostRespondedAt: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              coverPhoto: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePhoto: true,
                },
              },
            },
          },
        },
      });

      total = await prisma.review.count({
        where: {
          userId: user.id,
        },
      });
    }

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.overallRating,
      ratings: {
        overall: review.overallRating,
        cleanliness: review.cleanlinessRating,
        accuracy: review.accuracyRating,
        checkIn: review.checkInRating,
        communication: review.communicationRating,
        location: review.locationRating,
        value: review.valueRating,
      },
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      reviewer: role === 'host'
        ? {
            id: review.user.id,
            name: `${review.user.firstName} ${review.user.lastName}`.trim(),
            photo: review.user.profilePhoto,
          }
        : undefined,
      property: {
        id: review.property.id,
        title: review.property.title,
        city: review.property.city,
        coverPhoto: review.property?.coverPhoto,
        host: role === 'guest' && review.property.owner
          ? {
              id: review.property.owner.id,
              name: `${review.property.owner.firstName} ${review.property.owner.lastName}`.trim(),
              photo: review.property.owner.profilePhoto,
            }
          : undefined,
      },
      response: review.hostResponse
        ? {
            content: review.hostResponse,
            respondedAt: review.hostRespondedAt?.toISOString(),
          }
        : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + reviews.length < total,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
