/**
 * Favorites API Route - Single Resource Endpoints
 * Handles DELETE (remove from wishlist) and PATCH (update notes)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFavoriteService } from '@/infrastructure/di/Container';

/**
 * DELETE /api/v2/favorites/:id?userId=xxx
 * Remove favorite from wishlist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const favoriteId = params.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const favoriteService = getFavoriteService();
    await favoriteService.removeFavoriteById(userId, favoriteId);

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist successfully',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);

    // Handle business logic errors with 400
    if (error instanceof Error &&
        (error.message.includes('not found') ||
         error.message.includes('Unauthorized'))) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Unauthorized') ? 403 : 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove favorite',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v2/favorites/:id
 * Update notes on a favorite
 *
 * Body: { userId, notes }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, notes } = body;
    const favoriteId = params.id;

    if (!userId || notes === undefined) {
      return NextResponse.json(
        { success: false, error: 'userId and notes are required' },
        { status: 400 }
      );
    }

    const favoriteService = getFavoriteService();
    const favorite = await favoriteService.updateNotes(userId, favoriteId, notes);

    return NextResponse.json({
      success: true,
      data: favorite.toJSON(),
      message: 'Favorite updated successfully',
    });
  } catch (error) {
    console.error('Error updating favorite:', error);

    // Handle business logic errors with 400
    if (error instanceof Error &&
        (error.message.includes('not found') ||
         error.message.includes('Unauthorized'))) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Unauthorized') ? 403 : 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update favorite',
      },
      { status: 500 }
    );
  }
}
