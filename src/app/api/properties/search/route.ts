import { NextRequest, NextResponse } from 'next/server';
import { PropertyAPI } from '@/lib/backend-api';

// GET /api/properties/search - Search properties for discover page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get search parameters
    const location = searchParams.get('location');
    const guests = searchParams.get('guests');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const propertyType = searchParams.get('propertyType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🔍 Searching properties via backend API with filters:', {
      location,
      guests,
      minPrice,
      maxPrice,
      propertyType,
      page,
      limit,
    });

    // Use Backend API instead of direct Prisma call
    const response = await PropertyAPI.search({
      location: location || undefined,
      guests: guests ? parseInt(guests) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      type: propertyType || undefined,
      page,
      limit,
    });

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to search properties' },
        { status: 500 }
      );
    }

    // Transform response data to match frontend expectations
    const properties = response.data?.data || [];
    const formattedProperties = properties.map((property: any) => ({
      id: property.id,
      title: property.title,
      location: property.location || `${property.bedrooms} beds`,
      city: property.location?.split(',')[0]?.trim() || '',
      country: property.location?.split(',')[1]?.trim() || '',
      latitude: property.latitude,
      longitude: property.longitude,
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      sleeps: property.guests || 1,
      rating: property.rating || 0,
      reviewCount: property.reviews || 0,
      price: property.price || 0,
      image: property.images?.[0] || '/placeholder-property.jpg',
      propertyType: property.type,
      amenities: property.amenities || [],
      description: property.description,
    }));

    // Filter out properties without coordinates if requested
    const withCoordinates = searchParams.get('withCoordinates') === 'true';
    const filteredProperties = withCoordinates
      ? formattedProperties.filter((p: any) => p.latitude && p.longitude)
      : formattedProperties;

    console.log(`✅ Found ${filteredProperties.length} properties from backend API`);

    return NextResponse.json({
      success: true,
      count: filteredProperties.length,
      properties: filteredProperties,
      pagination: response.data?.pagination,
    });
  } catch (error) {
    console.error('❌ Error searching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}
