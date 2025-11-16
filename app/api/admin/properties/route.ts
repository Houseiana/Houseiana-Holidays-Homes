import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify admin JWT token
function getAdminFromToken(request: NextRequest): { userId: string; isAdmin: boolean } | null {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : request.cookies.get('auth_token')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return { userId: decoded.userId, isAdmin: true };
  } catch (error) {
    return null;
  }
}

// GET /api/admin/properties - Get properties pending review
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Verify user is actually an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING_REVIEW';

    console.log(`🔍 Admin fetching properties with status: ${status}`);

    // Fetch properties with host information
    const properties = await prisma.property.findMany({
      where: {
        status: status as any,
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePhoto: true,
            isHost: true,
            kycCompleted: true,
            memberSince: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        submittedForReviewAt: 'asc', // Oldest submissions first
      },
    });

    console.log(`✅ Found ${properties.length} properties for review`);

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error('❌ Error fetching properties for review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/admin/properties - Approve or reject property
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Verify user is actually an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, action, reviewNotes, rejectionReason } = body;

    if (!propertyId || !action) {
      return NextResponse.json(
        { success: false, error: 'Property ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    console.log(`🔍 Admin ${action}ing property: ${propertyId}`);

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Update property based on action
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        status: action === 'approve' ? 'PUBLISHED' : 'DRAFT',
        reviewedBy: admin.userId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
        rejectionReason: action === 'reject' ? rejectionReason : null,
        publishedAt: action === 'approve' ? new Date() : null,
        isActive: action === 'approve',
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Property ${action}ed successfully by admin ${adminUser.firstName} ${adminUser.lastName}`);

    // TODO: Send notification email to host
    // - If approved: "Congratulations! Your property is now live"
    // - If rejected: "Your property needs some changes"

    return NextResponse.json({
      success: true,
      message: `Property ${action}ed successfully`,
      property: updatedProperty,
      notification: {
        hostEmail: property.host.email,
        hostName: `${property.host.firstName} ${property.host.lastName}`,
        propertyTitle: property.title,
        action,
      },
    });
  } catch (error: any) {
    console.error('❌ Error processing property review:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process property review',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/properties - Bulk update properties
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Verify user is actually an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyIds, action } = body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property IDs array is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Admin bulk ${action} for ${propertyIds.length} properties`);

    // Bulk update properties
    const result = await prisma.property.updateMany({
      where: {
        id: { in: propertyIds },
      },
      data: {
        status: action === 'approve' ? 'PUBLISHED' : 'SUSPENDED',
        reviewedBy: admin.userId,
        reviewedAt: new Date(),
        isActive: action === 'approve',
      },
    });

    console.log(`✅ Bulk updated ${result.count} properties`);

    return NextResponse.json({
      success: true,
      message: `${result.count} properties updated successfully`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('❌ Error in bulk property update:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update properties',
      },
      { status: 500 }
    );
  }
}
