import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma-server';
import { getUserFromRequest } from '@/lib/auth';
import { geocodeAddress } from '@/lib/geocoding';

// GET /api/properties - Get all properties or filter by ownerId/hostId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId'); // Legacy support
    const ownerId = searchParams.get('ownerId') || hostId; // New field
    const city = searchParams.get('city');
    const propertyType = searchParams.get('propertyType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '0');

    console.log('🏠 Fetching properties with filters:', { ownerId, city, propertyType, status, limit });

    // Build filter object
    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) {
      where.status = status;
    } else if (!ownerId) {
      // Default to published properties only for public queries
      // For host dashboard (when ownerId is provided), show all statuses
      where.status = 'PUBLISHED';
      where.isActive = true;
    }

    // Fetch properties with relations
    const properties = await (prisma as any).property.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            kycStatus: true,
          },
        },
        kyc: {
          select: {
            verificationStatus: true,
          },
        },
        reviews: {
          select: {
            overallRating: true
          }
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          select: {
            id: true,
            status: true,
            checkIn: true,
            checkOut: true,
            totalPrice: true,
          }
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
      ...(limit > 0 && { take: limit })
    });

    console.log(`✅ Found ${properties.length} properties`);

    // Transform to match dashboard expectations (with host console fields)
    const items = properties.map((property: any) => {
      const reviews = property.reviews || []
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + (r.overallRating || 0), 0) / reviews.length
        : 0

      const photos = Array.isArray(property.photos) ? property.photos : []
      const coverPhoto = property.coverPhoto || (photos.length > 0 ? photos[0] : null)

      // Calculate occupancy (bookings in the last 30 days)
      const bookings = property.bookings || []
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentBookings = bookings.filter((b: any) => {
        const checkIn = new Date(b.checkIn)
        return checkIn >= thirtyDaysAgo
      })

      // Calculate total booked nights in last 30 days
      const bookedNights = recentBookings.reduce((total: number, b: any) => {
        const checkIn = new Date(b.checkIn)
        const checkOut = new Date(b.checkOut)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        return total + nights
      }, 0)

      const occupancy = Math.min(Math.round((bookedNights / 30) * 100), 100)

      // Calculate revenue from completed bookings
      const revenue = bookings
        .filter((b: any) => b.status === 'COMPLETED')
        .reduce((total: number, b: any) => total + (b.totalPrice || 0), 0)

      // Determine KYC status (property-specific KYC takes precedence)
      const rawKycStatus = property.kyc?.verificationStatus || property.owner?.kycStatus || 'PENDING'

      // Map database values to UI-friendly strings
      const kycStatusMap: Record<string, string> = {
        'APPROVED': 'Verified',
        'PENDING': 'Pending',
        'IN_REVIEW': 'In Review',
        'REJECTED': 'Rejected',
        'EXPIRED': 'Expired'
      }
      const kycStatus = kycStatusMap[rawKycStatus] || 'Pending'

      return {
        id: property.id,
        title: property.title,
        city: property.city,
        country: property.country,
        pricePerNight: property.pricePerNight || property.basePrice || 0,
        basePrice: property.pricePerNight || property.basePrice || 0, // Alias
        coverPhoto,
        photos,
        status: property.status,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: property._count?.reviews || 0,
        occupancy,
        revenue: Math.round(revenue * 100) / 100,
        kycStatus,
        _count: property._count
      }
    })

    return NextResponse.json({
      success: true,
      count: items.length,
      properties: items,
      items // Also include as items for consistency
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

    // CRITICAL FIX: Ensure user exists in database (Clerk user sync)
    try {
      const existingUser = await (prisma as any).user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        console.log('👤 User not found in database, creating user record:', userId);
        // Create user record in database
        await (prisma as any).user.create({
          data: {
            id: userId,
            email: `user_${userId}@clerk.temp`,  // Temporary email, will be updated by webhook
            firstName: 'User',
            lastName: '',
            isHost: true,
            kycStatus: 'PENDING'
          }
        });
        console.log('✅ User record created successfully');
      }
    } catch (userError) {
      console.error('⚠️ Error checking/creating user:', userError);
      // Continue anyway - the user might exist but there was a race condition
    }

    const body = await request.json();
    console.log('🏠 Creating property for user:', userId);

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
      kyc, // KYC data for host console
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

    // Geocode address to get coordinates if not provided
    let finalLatitude = latitude;
    let finalLongitude = longitude;

    if (!latitude || !longitude) {
      console.log('🌍 Geocoding address to get coordinates...');
      const geocodeResult = await geocodeAddress(address, city, country);

      if (geocodeResult) {
        finalLatitude = geocodeResult.latitude;
        finalLongitude = geocodeResult.longitude;
        console.log('✅ Coordinates obtained from geocoding:', {
          latitude: finalLatitude,
          longitude: finalLongitude,
        });
      } else {
        console.log('⚠️ Geocoding failed, property will be created without coordinates');
      }
    }

    // Check if KYC data has any meaningful values
    const hasKycData = kyc && (
      (kyc.hostName && kyc.hostName.trim() !== '') ||
      (kyc.hostIdType && kyc.hostIdType.trim() !== '') ||
      (kyc.hostIdNumber && kyc.hostIdNumber.trim() !== '') ||
      (kyc.companyName && kyc.companyName.trim() !== '') ||
      (kyc.crNumber && kyc.crNumber.trim() !== '')
    );

    console.log('🔍 KYC data check:', { hasKyc: !!kyc, hasKycData });

    // Create property in database with KYC only if there's actual data
    const property = await (prisma as any).property.create({
      data: {
        // User Backend fields
        ownerId: userId,
        ownerType: 'INDIVIDUAL', // Default to individual
        title,
        description,
        propertyType,
        roomType,
        country,
        city,
        state: state || null,
        address,
        zipCode: zipCode || null,
        latitude: finalLatitude || null,
        longitude: finalLongitude || null,
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

        // Administration Backend duplicate fields (required for unified schema)
        host_id: userId, // Same as ownerId
        property_type: propertyType?.toLowerCase() || 'villa',
        base_price: pricePerNight,
        approval_status: 'pending',
        street_address: address,
        zip_code: zipCode || null,
        max_guests: guests || 1,
        currency: 'USD',
        cleaning_fee: cleaningFee || 0,
        service_fee: serviceFee || 0,
        weekly_discount: weeklyDiscount || 0,
        monthly_discount: monthlyDiscount || 0,
        minimum_nights: minNights || 1,
        maximum_nights: maxNights || 365,
        check_in_time: checkInTime || '15:00',
        check_out_time: checkOutTime || '11:00',
        allow_pets: allowPets || false,
        allow_smoking: allowSmoking || false,
        allow_parties: allowEvents || false,
        ...(hasKycData && {
          kyc: {
            create: {
              hostName: kyc.hostName || '',
              hostIdType: kyc.hostIdType || null,
              hostIdNumber: kyc.hostIdNumber || null,
              hostIdExpiry: kyc.hostIdExpiry ? new Date(kyc.hostIdExpiry) : null,
              hostDob: kyc.hostDob ? new Date(kyc.hostDob) : null,
              companyName: kyc.companyName || null,
              crNumber: kyc.crNumber || null,
              crExpiry: kyc.crExpiry ? new Date(kyc.crExpiry) : null,
              idDocument: kyc.idDocument || null,
              deedDocument: kyc.deedDocument || null,
              utilityDocument: kyc.utilityDocument || null,
              verificationStatus: kyc.verificationStatus || 'PENDING',
            }
          }
        })
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
            kycStatus: true,
          },
        },
        kyc: true,
      },
    });

    console.log('✅ Property created successfully:', property.id);

    // Map KYC status to UI-friendly string
    const kycStatusMap: Record<string, string> = {
      'APPROVED': 'Verified',
      'PENDING': 'Pending',
      'IN_REVIEW': 'In Review',
      'REJECTED': 'Rejected',
      'EXPIRED': 'Expired'
    }
    const rawKycStatus = property.kyc?.verificationStatus || property.owner?.kycStatus || 'PENDING'
    const mappedKycStatus = kycStatusMap[rawKycStatus] || 'Pending'

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property: {
        ...property,
        kycStatus: mappedKycStatus
      }
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

    console.log('📝 Updating property:', id);

    // Check if property exists and belongs to user
    const existingProperty = await (prisma as any).property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this property' },
        { status: 403 }
      );
    }

    // Update property
    const updatedProperty = await (prisma as any).property.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            kycStatus: true,
          },
        },
        kyc: true,
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

    console.log('🗑️ Deleting property:', id);

    // Check if property exists and belongs to user
    const existingProperty = await (prisma as any).property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this property' },
        { status: 403 }
      );
    }

    // Delete property (cascades to bookings, reviews, favorites)
    await (prisma as any).property.delete({
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
