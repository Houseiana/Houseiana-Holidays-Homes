import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/properties - Get properties for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId');

    if (!hostId) {
      return NextResponse.json(
        { success: false, error: 'Host ID is required' },
        { status: 400 }
      );
    }

    console.log('🏠 Fetching properties for host:', hostId);

    // Get properties for the host
    const properties = await db.property.findByHostId(hostId);

    console.log('📋 Found properties:', properties.length);

    // Transform database results to match frontend expectations
    const transformedProperties = properties.map((property: any) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.property_type,
      status: property.status,
      address: {
        street: property.street_address,
        city: property.city,
        state: property.state,
        country: property.country,
        zipCode: property.zip_code,
        coordinates: property.latitude && property.longitude ? {
          lat: parseFloat(property.latitude),
          lng: parseFloat(property.longitude)
        } : null
      },
      pricing: {
        basePrice: parseFloat(property.base_price),
        currency: property.currency,
        cleaningFee: parseFloat(property.cleaning_fee || 0),
        serviceFee: parseFloat(property.service_fee || 0),
        weeklyDiscount: parseFloat(property.weekly_discount || 0),
        monthlyDiscount: parseFloat(property.monthly_discount || 0),
        minimumNights: property.minimum_nights,
        maximumNights: property.maximum_nights
      },
      amenities: property.amenities || [],
      photos: property.photos || [],
      rules: {
        checkIn: property.check_in_time,
        checkOut: property.check_out_time,
        maxGuests: property.max_guests,
        allowPets: property.allow_pets,
        allowSmoking: property.allow_smoking,
        allowParties: property.allow_parties,
        quietHours: {
          start: property.quiet_hours_start,
          end: property.quiet_hours_end
        }
      },
      availability: {
        minimumAdvanceNotice: property.minimum_advance_notice,
        preparationTime: property.preparation_time
      },
      bedrooms: property.bedrooms,
      bathrooms: parseFloat(property.bathrooms),
      hostId: property.host_id,
      ratings: {
        overall: parseFloat(property.average_rating || 0),
        totalReviews: property.total_reviews || 0
      },
      bookingCount: property.total_bookings || 0,
      totalEarnings: parseFloat(property.total_earnings || 0),
      viewsCount: property.views_count || 0,
      createdAt: property.created_at,
      updatedAt: property.updated_at
    }));

    return NextResponse.json({
      success: true,
      properties: transformedProperties
    });

  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🏠 Create property request:', body);

    const {
      hostId,
      title,
      description,
      propertyType,
      address,
      pricing,
      amenities,
      rules,
      bedrooms,
      bathrooms
    } = body;

    // Validate required fields
    if (!hostId || !title || !propertyType || !pricing?.basePrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: hostId, title, propertyType, and basePrice are required' },
        { status: 400 }
      );
    }

    // Create the property
    const propertyData = {
      hostId,
      title,
      description,
      propertyType,
      streetAddress: address?.street,
      city: address?.city,
      state: address?.state,
      country: address?.country,
      zipCode: address?.zipCode,
      latitude: address?.coordinates?.lat,
      longitude: address?.coordinates?.lng,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      maxGuests: rules?.maxGuests || 1,
      basePrice: pricing.basePrice,
      currency: pricing.currency || 'USD',
      cleaningFee: pricing.cleaningFee || 0,
      serviceFee: pricing.serviceFee || 0,
      weeklyDiscount: pricing.weeklyDiscount || 0,
      monthlyDiscount: pricing.monthlyDiscount || 0,
      minimumNights: pricing.minimumNights || 1,
      maximumNights: pricing.maximumNights || 365,
      checkInTime: rules?.checkIn || '15:00',
      checkOutTime: rules?.checkOut || '11:00',
      allowPets: rules?.allowPets || false,
      allowSmoking: rules?.allowSmoking || false,
      allowParties: rules?.allowParties || false,
      quietHoursStart: rules?.quietHours?.start || '22:00',
      quietHoursEnd: rules?.quietHours?.end || '08:00',
      status: 'active' // Set as active by default
    };

    const property = await db.property.create(propertyData);
    console.log('✅ Property created:', property.id);

    // Add amenities if provided
    if (amenities && amenities.length > 0) {
      for (const amenity of amenities) {
        await db.property.addAmenity(property.id, amenity);
      }
    }

    return NextResponse.json({
      success: true,
      property,
      message: 'Property created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create property' },
      { status: 500 }
    );
  }
}