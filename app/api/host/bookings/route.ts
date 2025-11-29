import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/host/bookings - Get all bookings for the authenticated host
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all bookings for host's properties
    const bookings = await prisma.booking.findMany({
      where: {
        hostId: user.id
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            createdAt: true,
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: true,
          }
        }
      },
      orderBy: {
        checkIn: 'desc'
      }
    });

    // Format response
    return NextResponse.json({
      success: true,
      data: bookings.map(booking => ({
        id: booking.id,
        confirmationCode: booking.id.substring(0, 8).toUpperCase(),
        propertyId: booking.property.id,
        propertyName: booking.property.title,
        propertyLocation: `${booking.property.city}, ${booking.property.country}`,
        guest: {
          name: `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() || 'Guest',
          email: booking.guest.email,
          phone: booking.guest.phone || 'Not provided',
          reviews: 0, // TODO: Implement reviews count
          verified: true,
          location: 'Not specified',
          memberSince: new Date(booking.guest.createdAt).getFullYear().toString(),
        },
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        nights: Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)),
        guests: {
          adults: booking.numberOfGuests,
          children: 0,
          infants: 0,
        },
        totalGuests: booking.numberOfGuests,
        status: booking.status.toLowerCase(),
        paymentStatus: booking.paymentStatus.toLowerCase(),
        totalAmount: booking.totalPrice,
        hostPayout: booking.totalPrice * 0.9, // 90% to host
        serviceFee: booking.totalPrice * 0.1, // 10% service fee
        currency: 'QAR',
        bookedAt: booking.createdAt.toISOString(),
        instantBook: false,
        specialRequests: booking.specialRequests || null,
        guestMessage: null,
      }))
    });

  } catch (error: any) {
    console.error('Get host bookings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookings',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
