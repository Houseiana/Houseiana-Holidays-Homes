import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserFromRequest } from '@/lib/auth';
import { PropertyAPI } from '@/lib/backend-api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

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

    // Use property-search endpoint for PUBLISHED properties (public view)
    // Use /api/properties for host-specific or admin views
    let apiUrl: string;
    if (status === 'PUBLISHED' && !ownerId) {
      // Public listing - use property-search endpoint
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (searchQuery) params.set('location', searchQuery);
      apiUrl = `${BACKEND_API_URL}/api/property-search?${params.toString()}`;
    } else {
      // Host/admin view - use properties endpoint
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (status) params.set('status', status);
      if (ownerId) params.set('hostId', ownerId);
      if (searchQuery) params.set('searchQuery', searchQuery);
      apiUrl = `${BACKEND_API_URL}/api/properties?${params.toString()}`;
    }

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Backend API error:', data.error || data.message);
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Transform response data to match frontend expectations
    // Handle both property-search format and /api/properties format
    const rawProperties = data.properties || data.data || [];
    const items = rawProperties.map((property: any) => {
      // Parse photos if it's a JSON string
      let photos: string[] = [];
      if (typeof property.photos === 'string') {
        try {
          photos = JSON.parse(property.photos);
        } catch {
          photos = property.photos ? [property.photos] : [];
        }
      } else if (Array.isArray(property.photos)) {
        photos = property.photos;
      }

      return {
        id: property.id,
        title: property.title,
        city: property.city || '',
        country: property.country || '',
        pricePerNight: property.pricePerNight || property.price || 0,
        basePrice: property.pricePerNight || property.price || 0,
        coverPhoto: property.coverPhoto || photos[0] || null,
        photos: photos,
        status: property.status,
        averageRating: property.averageRating || property.rating || 0,
        totalReviews: property.reviewCount || property.reviews || 0,
        occupancy: 0,
        revenue: 0,
        kycStatus: 'Pending',
        _count: { bookings: 0, reviews: property.reviewCount || 0, favorites: 0 }
      };
    });

    console.log(`✅ Found ${items.length} properties from backend API`);

    return NextResponse.json({
      success: true,
      count: items.length,
      properties: items,
      items,
      pagination: data.pagination,
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
