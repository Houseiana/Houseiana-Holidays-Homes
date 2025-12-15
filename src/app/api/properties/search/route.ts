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

    // Backend returns { success: true, data: [...properties], pagination: {...} }
    // Handle both direct array and nested data structures
    let rawProperties: any[] = [];
    if (Array.isArray(response.data)) {
      rawProperties = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Could be { data: [...], pagination: {...} } or just the properties array
      rawProperties = Array.isArray((response.data as any).data)
        ? (response.data as any).data
        : [];
    }

    // Filter only PUBLISHED properties
    const publishedProperties = rawProperties.filter((p: any) => p.status === 'PUBLISHED');

    // Transform response data to match frontend expectations
    const formattedProperties = publishedProperties.map((property: any) => {
      // Parse photos if it's a JSON string
      let photos = property.photos;
      if (typeof photos === 'string') {
        try {
          photos = JSON.parse(photos);
        } catch {
          photos = [];
        }
      }

      // Build location string from city, address, country
      const locationParts = [property.city, property.country].filter(Boolean);
      const locationString = locationParts.length > 0
        ? locationParts.join(', ')
        : property.address || `${property.bedrooms} beds`;

      return {
        id: property.id,
        title: property.title?.trim() || 'Unnamed Property',
        location: locationString,
        city: property.city || '',
        country: property.country || '',
        address: property.address,
        latitude: property.latitude,
        longitude: property.longitude,
        beds: property.bedrooms || property.beds || 0,
        baths: property.bathrooms || 0,
        sleeps: property.guests || 1,
        rating: property.averageRating || property.rating || 0,
        reviewCount: property.reviews || 0,
        price: property.pricePerNight || property.price || 0,
        image: property.coverPhoto || (Array.isArray(photos) && photos[0]) || '/placeholder-property.jpg',
        images: Array.isArray(photos) ? photos : [],
        propertyType: property.propertyType || property.type,
        amenities: typeof property.amenities === 'string' ? JSON.parse(property.amenities || '[]') : (property.amenities || []),
        description: property.description,
        instantBook: property.instantBook,
      };
    });

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
