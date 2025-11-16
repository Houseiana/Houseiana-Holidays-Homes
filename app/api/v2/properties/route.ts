/**
 * Properties API Route (v2 - Using OOP Architecture)
 * Demonstrates: Clean Architecture, Dependency Injection, Service Layer Usage
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPropertyService } from '@/infrastructure/di/Container';
import { CreatePropertyDTO } from '@/application/services/PropertyService';
import { PropertyType } from '@/domain/entities/Property';
import { PropertySearchCriteria } from '@/domain/repositories/IPropertyRepository';
import { DateRange } from '@/domain/value-objects/DateRange';

/**
 * GET /api/v2/properties
 * Search properties with various filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyService = getPropertyService();

    // Check if getting properties for a specific host
    const hostId = searchParams.get('hostId');
    if (hostId) {
      const properties = await propertyService.getHostProperties(hostId);
      return NextResponse.json({
        success: true,
        data: properties.map(p => p.toJSON()),
      });
    }

    // Check if getting featured properties
    const featured = searchParams.get('featured');
    if (featured === 'true') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const properties = await propertyService.getFeaturedProperties(limit);
      return NextResponse.json({
        success: true,
        data: properties.map(p => p.toJSON()),
      });
    }

    // Check if getting recent properties
    const recent = searchParams.get('recent');
    if (recent === 'true') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const properties = await propertyService.getRecentProperties(limit);
      return NextResponse.json({
        success: true,
        data: properties.map(p => p.toJSON()),
      });
    }

    // Build search criteria
    const criteria: PropertySearchCriteria = {};

    const location = searchParams.get('location');
    if (location) {
      criteria.location = location;
    }

    const type = searchParams.get('type');
    if (type) {
      criteria.type = type as PropertyType;
    }

    const minPrice = searchParams.get('minPrice');
    if (minPrice) {
      criteria.minPrice = parseFloat(minPrice);
    }

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      criteria.maxPrice = parseFloat(maxPrice);
    }

    const minGuests = searchParams.get('minGuests');
    if (minGuests) {
      criteria.minGuests = parseInt(minGuests);
    }

    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) {
      criteria.bedrooms = parseInt(bedrooms);
    }

    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) {
      criteria.bathrooms = parseInt(bathrooms);
    }

    const amenities = searchParams.get('amenities');
    if (amenities) {
      criteria.amenities = amenities.split(',');
    }

    const instantBooking = searchParams.get('instantBooking');
    if (instantBooking === 'true') {
      criteria.instantBooking = true;
    }

    // Date range for availability filtering
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      criteria.dateRange = DateRange.create(startDate, endDate);
    }

    // Geospatial search
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radiusKm');

    if (lat && lng && radiusKm) {
      const properties = await propertyService.searchNearLocation(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radiusKm)
      );

      return NextResponse.json({
        success: true,
        data: properties.map(p => p.toJSON()),
      });
    }

    // General search
    const properties = await propertyService.searchProperties(criteria);

    return NextResponse.json({
      success: true,
      data: properties.map(p => p.toJSON()),
    });

  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search properties'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v2/properties
 * Create a new property listing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'hostId', 'title', 'description', 'type', 'address',
      'pricePerNight', 'maxGuests', 'bedrooms', 'bathrooms', 'beds',
      'amenities', 'images', 'rules'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`
          },
          { status: 400 }
        );
      }
    }

    // Create DTO
    const dto: CreatePropertyDTO = {
      hostId: body.hostId,
      title: body.title,
      description: body.description,
      type: body.type,
      address: {
        street: body.address.street,
        city: body.address.city,
        state: body.address.state,
        country: body.address.country,
        postalCode: body.address.postalCode,
        coordinates: body.address.coordinates,
      },
      pricePerNight: body.pricePerNight,
      cleaningFee: body.cleaningFee,
      maxGuests: body.maxGuests,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      beds: body.beds,
      amenities: body.amenities,
      images: body.images,
      rules: {
        checkInTime: body.rules.checkInTime,
        checkOutTime: body.rules.checkOutTime,
        petsAllowed: body.rules.petsAllowed,
        smokingAllowed: body.rules.smokingAllowed,
        partiesAllowed: body.rules.partiesAllowed,
      },
      minimumStay: body.minimumStay,
      instantBooking: body.instantBooking,
    };

    // Get service from DI container
    const propertyService = getPropertyService();

    // Create property using service
    const property = await propertyService.createProperty(dto);

    return NextResponse.json({
      success: true,
      data: property.toJSON(),
      message: 'Property created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating property:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create property'
      },
      { status: 500 }
    );
  }
}
