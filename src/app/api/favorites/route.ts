import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { FavoritesAPI } from '@/lib/backend-api';

// GET /api/favorites - Get user's favorite properties
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`🔍 Fetching favorites via backend API for user: ${user.userId}`);

    const response = await FavoritesAPI.getUserFavorites(user.userId);

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    const favorites = response.data || [];
    console.log(`✅ Found ${favorites.length} favorites`);

    return NextResponse.json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add property to favorites
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    console.log(`❤️ Adding property ${propertyId} to favorites via backend API`);

    const response = await FavoritesAPI.addFavorite(user.userId, propertyId);

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Property not found' },
          { status: 404 }
        );
      }
      if (response.error?.includes('already')) {
        return NextResponse.json(
          { success: false, error: 'Property already in favorites' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: response.error || 'Failed to add favorite' },
        { status: 400 }
      );
    }

    console.log(`✅ Property added to favorites`);

    return NextResponse.json({
      success: true,
      message: 'Property added to favorites',
      favorite: response.data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding favorite:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add favorite',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove property from favorites
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json(
        { success: false, error: 'Favorite ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Removing favorite via backend API: ${favoriteId}`);

    const response = await FavoritesAPI.removeFavorite(favoriteId, user.userId);

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);

      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Favorite not found' },
          { status: 404 }
        );
      }
      if (response.error?.includes('permission')) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to remove this favorite' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, error: response.error || 'Failed to remove favorite' },
        { status: 400 }
      );
    }

    console.log(`✅ Favorite removed: ${favoriteId}`);

    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites',
    });
  } catch (error: any) {
    console.error('❌ Error removing favorite:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to remove favorite',
      },
      { status: 500 }
    );
  }
}
