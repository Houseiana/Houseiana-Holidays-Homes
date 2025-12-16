import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🏠 Fetching property from backend API:', id);

    // Use the property-search endpoint for proper formatted response
    const response = await fetch(`${BACKEND_API_URL}/api/property-search/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!data.success || !data.data) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = data.data;

    // Parse photos and amenities if they're JSON strings
    let images: string[] = [];
    if (typeof property.photos === 'string') {
      try {
        images = JSON.parse(property.photos);
      } catch {
        images = property.photos ? [property.photos] : [];
      }
    } else if (Array.isArray(property.photos)) {
      images = property.photos;
    }

    let amenities: string[] = [];
    if (typeof property.amenities === 'string') {
      try {
        amenities = JSON.parse(property.amenities);
      } catch {
        amenities = [];
      }
    } else if (Array.isArray(property.amenities)) {
      amenities = property.amenities;
    }

    // Format property data for frontend consumption
    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.propertyType || 'Property',
      location: `${property.city || ''}, ${property.country || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
      latitude: property.latitude,
      longitude: property.longitude,
      city: property.city || '',
      country: property.country || '',
      price: property.pricePerNight || 0,
      rating: property.averageRating || 0,
      reviews: property.reviewCount || 0,
      images: images.length > 0 ? images : (property.coverPhoto ? [property.coverPhoto] : []),
      amenities: amenities,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      guests: property.guests || 1,
      status: property.status,
      host: property.host ? {
        id: property.host.id,
        name: `${property.host.firstName || ''} ${property.host.lastName || ''}`.trim() || 'Host',
        avatar: property.host.avatar || '',
        joinDate: 'Recently joined',
        verified: false,
      } : {
        name: 'Host',
        avatar: '',
        joinDate: 'Recently joined',
        verified: false,
      },
      isRareFind: false,
      guestFavorite: false,
    };

    console.log('✅ Property loaded from backend API successfully');

    return NextResponse.json({
      success: true,
      property: formattedProperty,
    });
  } catch (error: any) {
    console.error('❌ Error fetching property from backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
