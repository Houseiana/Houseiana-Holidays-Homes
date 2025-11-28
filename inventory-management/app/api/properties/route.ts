import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/properties - Create new property (inventory manager)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Host selection
      hostId, // Required: ID of the host who will own this property

      // Property basics
      title,
      description,
      propertyType,

      // Location
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,

      // Capacity & spaces
      guests,
      bedrooms,
      beds,
      bathrooms,

      // Pricing
      pricePerNight,
      cleaningFee,
      serviceFee,
      weeklyDiscount,
      monthlyDiscount,

      // Features
      amenities,
      photos,
      coverPhoto,

      // Rules & policies
      checkInTime,
      checkOutTime,
      minNights,
      maxNights,
      instantBook,
      allowPets,
      allowSmoking,
      allowEvents,

      // KYC data (optional)
      kyc,

      // Admin options
      autoPublish, // If true, set status to PUBLISHED immediately
    } = body;

    // Validation
    if (!hostId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Host ID is required',
        },
        { status: 400 }
      );
    }

    if (!title || !propertyType || !city || !country || !pricePerNight) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, property type, city, country, and price are required',
        },
        { status: 400 }
      );
    }

    // Verify host exists
    const host = await prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      return NextResponse.json(
        {
          success: false,
          error: 'Host not found',
        },
        { status: 404 }
      );
    }

    if (!host.isHost) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a host',
        },
        { status: 400 }
      );
    }

    // Check if KYC data is provided
    const hasKycData = kyc && (kyc.hostName || kyc.hostIdNumber || kyc.deedDocument);

    // Create property
    console.log('Creating property for host:', hostId);
    const property = await prisma.property.create({
      data: {
        id: `prop_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ownerId: hostId,
        ownerType: 'INDIVIDUAL',
        title,
        description: description || '',
        propertyType: propertyType?.toUpperCase() || 'VILLA',
        address: address || '',
        city,
        state: state || null,
        country,
        zipCode: zipCode || null,
        latitude: latitude || null,
        longitude: longitude || null,
        guests: guests || 1,
        bedrooms: bedrooms || 1,
        beds: beds || 1,
        bathrooms: bathrooms || 1,
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

        // Status - auto-publish if requested, otherwise pending review
        status: autoPublish ? 'PUBLISHED' : 'PENDING_REVIEW',
        submittedForReviewAt: autoPublish ? null : new Date(),
        publishedAt: autoPublish ? new Date() : null,

        // Administration Backend duplicate fields (required for unified schema)
        host_id: hostId,
        property_type: propertyType?.toLowerCase() || 'villa',
        base_price: pricePerNight,
        approval_status: autoPublish ? 'approved' : 'pending',
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

        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),

        ...(hasKycData && {
          kyc: {
            create: {
              hostName: kyc.hostName || `${host.firstName} ${host.lastName}`,
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
            },
          },
        }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        kyc: true,
      },
    });

    console.log('✅ Property created successfully:', property.id);
    console.log('   Status:', property.status);
    console.log('   Owner:', property.owner.firstName, property.owner.lastName);

    // Create audit log for property creation
    await prisma.auditLog.create({
      data: {
        userId: 'admin', // TODO: Get from auth session
        action: 'CREATE_PROPERTY',
        entityType: 'property',
        entityId: property.id,
        changes: {
          hostId,
          title,
          status: property.status,
          autoPublish,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: autoPublish
          ? 'Property created and published successfully'
          : 'Property created and submitted for review',
        property: {
          id: property.id,
          title: property.title,
          status: property.status,
          approval_status: property.approval_status,
          owner: {
            id: property.owner.id,
            name: `${property.owner.firstName} ${property.owner.lastName}`,
            email: property.owner.email,
          },
          publishedAt: property.publishedAt,
        },
      },
      { status: 201 }
    );
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
