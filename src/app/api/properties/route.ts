import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserFromRequest } from '@/lib/auth';
import { PropertyAPI } from '@/lib/backend-api';

// GET /api/properties - Get all properties or filter by ownerId/hostId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId'); // Legacy support
    const ownerId = searchParams.get('ownerId') || hostId; // New field
    const status = searchParams.get('status');
    const searchQuery = searchParams.get('searchQuery');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🏠 Fetching properties from backend API with filters:', { ownerId, status, searchQuery, page, limit });

    // Use Backend API instead of direct Prisma call
    const response = await PropertyAPI.getAll({
      hostId: ownerId || undefined,
      status: status || undefined,
      searchQuery: searchQuery || undefined,
      page,
      limit,
    });

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Transform response data to match frontend expectations
    const properties = response.data?.data || [];
    const items = properties.map((property: any) => ({
      id: property.id,
      title: property.title,
      city: property.location?.split(',')[0]?.trim() || '',
      country: property.location?.split(',')[1]?.trim() || '',
      pricePerNight: property.price || 0,
      basePrice: property.price || 0,
      coverPhoto: property.images?.[0] || null,
      photos: property.images || [],
      status: property.status,
      averageRating: property.rating || 0,
      totalReviews: property.reviews || 0,
      occupancy: 0,
      revenue: 0,
      kycStatus: 'Pending',
      _count: { bookings: 0, reviews: property.reviews || 0, favorites: 0 }
    }));

    console.log(`✅ Found ${items.length} properties from backend API`);

    return NextResponse.json({
      success: true,
      count: items.length,
      properties: items,
      items,
      pagination: response.data?.pagination,
    });
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property via Backend API
export async function POST(request: NextRequest) {
  try {
    // Try Clerk authentication first
    const { userId: clerkUserId } = await auth();

    // Fall back to JWT authentication if no Clerk session
    const jwtUser = getUserFromRequest(request);

    const userId = clerkUserId || jwtUser?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('🏠 Creating property via backend API for user:', userId);

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
      newListingDiscount,
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
    if (!title || !description || !propertyType || !country || !city || !address || !pricePerNight) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, propertyType, country, city, address, and pricePerNight are required',
        },
        { status: 400 }
      );
    }

    // Use Backend API to create property
    const response = await PropertyAPI.create({
      hostId: userId,
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
      guests: guests || 1,
      bedrooms: bedrooms || 0,
      beds: beds || 0,
      bathrooms: bathrooms || 0,
      pricePerNight,
      cleaningFee: cleaningFee || 0,
      serviceFee: serviceFee || 0,
      weeklyDiscount: weeklyDiscount || 0,
      monthlyDiscount: monthlyDiscount || 0,
      newListingDiscount: newListingDiscount || 0,
      amenities: amenities || [],
      photos: photos || [],
      coverPhoto,
      checkInTime: checkInTime || '15:00',
      checkOutTime: checkOutTime || '11:00',
      minNights: minNights || 1,
      maxNights,
      instantBook: instantBook || false,
      allowPets: allowPets || false,
      allowSmoking: allowSmoking || false,
      allowEvents: allowEvents || false,
      status: status || 'DRAFT',
    });

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create property' },
        { status: 400 }
      );
    }

    console.log('✅ Property created via backend API:', response.data?.id);

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property: response.data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}

// PUT /api/properties - Update an existing property via Backend API
export async function PUT(request: NextRequest) {
  try {
    // Try Clerk authentication first
    const { userId: clerkUserId } = await auth();

    // Fall back to JWT authentication if no Clerk session
    const jwtUser = getUserFromRequest(request);

    const userId = clerkUserId || jwtUser?.userId;

    if (!userId) {
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

    console.log('📝 Updating property via backend API:', id);

    // Use Backend API to update property
    const response = await PropertyAPI.update(id, {
      ...updateData,
      hostId: userId,
    });

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to update property' },
        { status: 400 }
      );
    }

    console.log('✅ Property updated via backend API:', id);

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: response.data,
    });
  } catch (error: any) {
    console.error('❌ Error updating property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties - Delete a property via Backend API
export async function DELETE(request: NextRequest) {
  try {
    // Try Clerk authentication first
    const { userId: clerkUserId } = await auth();

    // Fall back to JWT authentication if no Clerk session
    const jwtUser = getUserFromRequest(request);

    const userId = clerkUserId || jwtUser?.userId;

    if (!userId) {
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

    console.log('🗑️ Deleting property via backend API:', id);

    // Use Backend API to delete property
    const response = await PropertyAPI.delete(id);

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete property' },
        { status: 400 }
      );
    }

    console.log('✅ Property deleted via backend API:', id);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}
