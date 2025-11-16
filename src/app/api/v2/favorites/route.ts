/**
 * Favorites API Route - Collection Endpoints
 * Handles GET (list user's favorites) and POST (add to wishlist)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFavoriteService } from '@/infrastructure/di/Container';

/**
 * GET /api/v2/favorites?userId=xxx
 * Get all favorites for a user with property details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const favoriteService = getFavoriteService();
    const wishlist = await favoriteService.getUserWishlist(userId);

    // Map to clean response format
    const response = wishlist.map(item => ({
      favorite: item.favorite.toJSON(),
      property: item.property?.toJSON() || null,
    }));

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch favorites',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v2/favorites
 * Add property to user's wishlist
 *
 * Body: { userId, propertyId, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, propertyId, notes } = body;

    if (!userId || !propertyId) {
      return NextResponse.json(
        { success: false, error: 'userId and propertyId are required' },
        { status: 400 }
      );
    }

    const favoriteService = getFavoriteService();
    const favorite = await favoriteService.addToWishlist(userId, propertyId, notes);

    return NextResponse.json(
      {
        success: true,
        data: favorite.toJSON(),
        message: 'Added to wishlist successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to wishlist:', error);

    // Handle business logic errors with 400
    if (error instanceof Error &&
        (error.message.includes('already in') ||
         error.message.includes('not found'))) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add to wishlist',
      },
      { status: 500 }
    );
  }
}
