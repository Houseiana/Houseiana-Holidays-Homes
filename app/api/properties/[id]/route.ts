import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🏠 Fetching property:', id);

    const property = await (prisma as any).property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
            kycStatus: true,
            createdAt: true,
          },
        },
        kyc: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
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
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const reviews = property.reviews || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.overallRating || 0), 0) / reviews.length
      : 0;

    // Format property data
    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.propertyType || 'Property',
      location: `${property.city}, ${property.country}`,
      city: property.city,
      country: property.country,
      state: property.state,
      address: property.address,
      latitude: property.latitude,
      longitude: property.longitude,
      price: property.pricePerNight || property.basePrice || 0,
      cleaningFee: property.cleaningFee || property.cleaning_fee || 0,
      serviceFee: property.serviceFee || property.service_fee || 0,
      rating: Math.round(avgRating * 100) / 100,
      reviews: property._count?.reviews || 0,
      images: Array.isArray(property.photos) ? property.photos : [],
      coverPhoto: property.coverPhoto,
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      beds: property.beds || 0,
      guests: property.guests || property.max_guests || 1,
      checkInTime: property.checkInTime || property.check_in_time || '15:00',
      checkOutTime: property.checkOutTime || property.check_out_time || '11:00',
      minNights: property.minNights || property.minimum_nights || 1,
      maxNights: property.maxNights || property.maximum_nights || null,
      instantBook: property.instantBook || false,
      allowPets: property.allowPets || property.allow_pets || false,
      allowSmoking: property.allowSmoking || property.allow_smoking || false,
      allowEvents: property.allowEvents || property.allow_parties || false,
      status: property.status,
      isActive: property.isActive,
      host: property.owner ? {
        id: property.owner.id,
        name: `${property.owner.firstName} ${property.owner.lastName}`.trim(),
        firstName: property.owner.firstName,
        lastName: property.owner.lastName,
        avatar: property.owner.profilePhoto || null,
        joinDate: property.owner.createdAt?.toISOString() || new Date().toISOString(),
        verified: property.owner.kycStatus === 'APPROVED',
      } : null,
      reviewsList: reviews.map((review: any) => ({
        id: review.id,
        rating: review.overallRating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: review.user ? {
          id: review.user.id,
          name: `${review.user.firstName} ${review.user.lastName}`.trim(),
          avatar: review.user.profilePhoto,
        } : null,
      })),
      isRareFind: (property._count?.favorites || 0) > 50,
      guestFavorite: (property._count?.favorites || 0) > 20,
    };

    console.log('✅ Property loaded successfully');

    return NextResponse.json({
      success: true,
      property: formattedProperty,
    });
  } catch (error: any) {
    console.error('❌ Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
