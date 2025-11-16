import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to get user from JWT token
function getUserFromToken(request: NextRequest): { userId: string } | null {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : request.cookies.get('auth_token')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/favorites - Get user's favorite properties
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`🔍 Fetching favorites for user: ${user.userId}`);

    // Fetch favorites with property details
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                bookings: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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
    // Authenticate user
    const user = getUserFromToken(request);
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

    console.log(`❤️ Adding property ${propertyId} to favorites for user ${user.userId}`);

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'Property already in favorites' },
        { status: 400 }
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.userId,
        propertyId,
      },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Property added to favorites: ${favorite.id}`);

    return NextResponse.json({
      success: true,
      message: 'Property added to favorites',
      favorite,
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
    // Authenticate user
    const user = getUserFromToken(request);
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

    console.log(`🗑️ Removing favorite: ${favoriteId}`);

    // Check if favorite exists and belongs to user
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    if (favorite.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to remove this favorite' },
        { status: 403 }
      );
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: { id: favoriteId },
    });

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
