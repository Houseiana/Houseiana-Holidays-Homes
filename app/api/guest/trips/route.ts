import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/guest/trips - Get all trips/bookings for the authenticated guest
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

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, upcoming, past, cancelled

    // Build where clause
    const where: any = { guestId: user.id };
    const now = new Date();

    if (filter === 'upcoming') {
      where.status = { in: ['PENDING', 'CONFIRMED'] };
      where.checkIn = { gte: now };
    } else if (filter === 'past') {
      where.checkOut = { lt: now };
      where.status = { notIn: ['CANCELLED'] };
    } else if (filter === 'cancelled') {
      where.status = 'CANCELLED';
    }

    // Get bookings with property details
    const bookings = await prisma.booking.findMany({
      where,
      include: {
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
      orderBy: { checkIn: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: bookings.map(booking => ({
        id: booking.id,
        propertyId: booking.property.id,
        propertyTitle: booking.property.title,
        propertyCity: booking.property.city,
        propertyCountry: booking.property.country,
        coverPhoto: Array.isArray(booking.property.images) && booking.property.images.length > 0
          ? booking.property.images[0]
          : null,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        guests: booking.numberOfGuests,
        totalPrice: booking.totalPrice,
        status: booking.status.toLowerCase(),
        confirmationCode: booking.id.substring(0, 8).toUpperCase(),
      }))
    });

  } catch (error: any) {
    console.error('Get trips error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trips',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
