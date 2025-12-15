import { NextRequest, NextResponse } from 'next/server';
import { PropertyAPI } from '@/lib/backend-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🏠 Fetching property from backend API:', id);

    // Use Backend API instead of direct Prisma call
    const response = await PropertyAPI.getById(id);

    if (!response.success || !response.data) {
      return NextResponse.json(
        { success: false, error: response.error || 'Property not found' },
        { status: 404 }
      );
    }

    const property = response.data;

    // Format property data for frontend consumption
    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.type || 'Property',
      location: property.location || `${property.bedrooms} beds`,
      city: property.location?.split(',')[0]?.trim() || '',
      country: property.location?.split(',')[1]?.trim() || '',
      price: property.price || 0,
      rating: property.rating || 0,
      reviews: property.reviews || 0,
      images: property.images || [],
      amenities: property.amenities || [],
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      guests: property.guests || 1,
      status: property.status,
      host: property.host || null,
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
