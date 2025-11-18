import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/properties/search - Search properties for discover page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get search parameters
    const location = searchParams.get('location');
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const guests = searchParams.get('guests');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const propertyType = searchParams.get('propertyType');
    const beds = searchParams.get('beds');
    const baths = searchParams.get('baths');

    console.log('🔍 Searching properties with filters:', {
      location,
      checkin,
      checkout,
      guests,
      adults,
      children,
      minPrice,
      maxPrice,
      propertyType,
      beds,
      baths,
    });

    // Build filter object
    const where: any = {
      status: 'PUBLISHED', // Only show published properties
      isActive: true,
    };

    // Location filter (search in city, state, country, or address)
    if (location) {
      where.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
        { country: { contains: location, mode: 'insensitive' } },
        { address: { contains: location, mode: 'insensitive' } },
      ];
    }

    // Guest capacity filter
    if (guests) {
      where.guests = { gte: parseInt(guests) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }

    // Property type filter
    if (propertyType) {
      where.propertyType = propertyType;
    }

    // Bedrooms filter
    if (beds) {
      where.beds = { gte: parseInt(beds) };
    }

    // Bathrooms filter
    if (baths) {
      where.bathrooms = { gte: parseFloat(baths) };
    }

    // Fetch properties with relations and reviews
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
        reviews: {
          select: {
            overallRating: true,
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

    // Calculate average rating for each property
    const propertiesWithRatings = properties.map((property) => {
      const reviewCount = property._count.reviews;
      let averageRating = 0;

      if (reviewCount > 0 && property.reviews.length > 0) {
        const totalRating = property.reviews.reduce(
          (sum, review) => sum + review.overallRating,
          0
        );
        averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
      }

      // Extract photos array from JSON
      const photos = Array.isArray(property.photos) ? property.photos : [];
      const image = property.coverPhoto || photos[0] || '/placeholder-property.jpg';

      return {
        id: property.id,
        title: property.title,
        location: `${property.city}, ${property.country}`,
        city: property.city,
        country: property.country,
        latitude: property.latitude,
        longitude: property.longitude,
        beds: property.beds,
        baths: property.bathrooms,
        sleeps: property.guests,
        rating: averageRating,
        reviewCount: reviewCount,
        price: property.pricePerNight,
        image: image,
        propertyType: property.propertyType,
        amenities: property.amenities,
        description: property.description,
      };
    });

    // Filter out properties without coordinates if requested
    const withCoordinates = searchParams.get('withCoordinates') === 'true';
    const filteredProperties = withCoordinates
      ? propertiesWithRatings.filter((p) => p.latitude && p.longitude)
      : propertiesWithRatings;

    console.log(`✅ Found ${filteredProperties.length} properties`);

    return NextResponse.json({
      success: true,
      count: filteredProperties.length,
      properties: filteredProperties,
    });
  } catch (error) {
    console.error('❌ Error searching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}
