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

// GET /api/properties - Get all properties or filter by hostId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId');
    const city = searchParams.get('city');
    const propertyType = searchParams.get('propertyType');
    const status = searchParams.get('status');

    console.log('🏠 Fetching properties with filters:', { hostId, city, propertyType, status });

    // Build filter object
    const where: any = {};
    if (hostId) where.hostId = hostId;
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;

    // Fetch properties with relations
    const properties = await prisma.property.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            isHost: true,
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
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${properties.length} properties`);

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property (requires authentication)
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
    console.log('🏠 Creating property for user:', user.userId);

    const {
      title,
      description,
      propertyType,
      roomType,
      country,
      city,
      state,
      address,
      zipCode,
      latitude,
      longitude,
      guests,
      bedrooms,
      beds,
      bathrooms,
      pricePerNight,
      cleaningFee,
      serviceFee,
      weeklyDiscount,
      monthlyDiscount,
      amenities,
      photos,
      coverPhoto,
      checkInTime,
      checkOutTime,
      minNights,
      maxNights,
      instantBook,
      allowPets,
      allowSmoking,
      allowEvents,
      status,
    } = body;

    // Validate required fields
    if (!title || !description || !propertyType || !roomType || !country || !city || !address || !pricePerNight) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, propertyType, roomType, country, city, address, and pricePerNight are required',
        },
        { status: 400 }
      );
    }

    if (!guests || guests < 1) {
      return NextResponse.json(
        { success: false, error: 'At least 1 guest must be allowed' },
        { status: 400 }
      );
    }

    // Create property in database
    const property = await prisma.property.create({
      data: {
        hostId: user.userId,
        title,
        description,
        propertyType,
        roomType,
        country,
        city,
        state: state || null,
        address,
        zipCode: zipCode || null,
        latitude: latitude || null,
        longitude: longitude || null,
        guests: guests || 1,
        bedrooms: bedrooms || 0,
        beds: beds || 0,
        bathrooms: bathrooms || 0,
        pricePerNight,
        cleaningFee: cleaningFee || 0,
        serviceFee: serviceFee || 0,
        weeklyDiscount: weeklyDiscount || 0,
        monthlyDiscount: monthlyDiscount || 0,
        amenities: amenities || [],
        photos: photos || [],
        coverPhoto: coverPhoto || null,
        checkInTime: checkInTime || '15:00',
        checkOutTime: checkOutTime || '11:00',
        minNights: minNights || 1,
        maxNights: maxNights || null,
        instantBook: instantBook || false,
        allowPets: allowPets || false,
        allowSmoking: allowSmoking || false,
        allowEvents: allowEvents || false,
        status: status || 'DRAFT',
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    console.log('✅ Property created successfully:', property.id);

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property,
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create property',
      },
      { status: 500 }
    );
  }
}

// PUT /api/properties - Update an existing property (requires authentication)
export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating property:', id);

    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.hostId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this property' },
        { status: 403 }
      );
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    console.log('✅ Property updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty,
    });
  } catch (error: any) {
    console.error('❌ Error updating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update property',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/properties - Delete a property (requires authentication)
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting property:', id);

    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.hostId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this property' },
        { status: 403 }
      );
    }

    // Delete property (cascades to bookings, reviews, favorites)
    await prisma.property.delete({
      where: { id },
    });

    console.log('✅ Property deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete property',
      },
      { status: 500 }
    );
  }
}
