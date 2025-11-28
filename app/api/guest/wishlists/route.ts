import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/guest/wishlists - Get all wishlists for the authenticated guest
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get wishlists with their properties
    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        properties: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                images: true,
              }
            }
          },
          take: 4, // Get first 4 properties for preview
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { properties: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: wishlists.map(wishlist => ({
        id: wishlist.id,
        name: wishlist.name,
        savedCount: wishlist._count.properties,
        previewImages: wishlist.properties
          .map(wp => {
            const images = wp.property.images;
            return Array.isArray(images) && images.length > 0 ? images[0] : null;
          })
          .filter(img => img !== null)
      }))
    });

  } catch (error: any) {
    console.error('Get wishlists error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch wishlists',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/guest/wishlists - Create new wishlist
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Wishlist name is required' },
        { status: 400 }
      );
    }

    // Create wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
        name
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: wishlist.id,
        name: wishlist.name,
        savedCount: 0,
        previewImages: []
      }
    });

  } catch (error: any) {
    console.error('Create wishlist error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create wishlist',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
