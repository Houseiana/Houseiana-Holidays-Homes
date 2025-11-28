import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/host/conversations - Get all conversations for the authenticated host
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

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {
      hostId: user.id
    };

    // Apply filters
    if (filter === 'unread') {
      where.unreadCountHost = { gt: 0 };
    } else if (filter === 'starred') {
      where.isStarredByHost = true;
    } else if (filter === 'pending') {
      // Find conversations linked to pending bookings
      const pendingBookings = await prisma.booking.findMany({
        where: { hostId: user.id, status: 'PENDING' },
        select: { id: true }
      });
      where.bookingId = { in: pendingBookings.map(b => b.id) };
    } else if (filter === 'hosting') {
      // Find conversations linked to active bookings
      const activeBookings = await prisma.booking.findMany({
        where: {
          hostId: user.id,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          checkIn: { lte: new Date() },
          checkOut: { gte: new Date() }
        },
        select: { id: true }
      });
      where.bookingId = { in: activeBookings.map(b => b.id) };
    } else if (filter === 'archived') {
      where.status = 'ARCHIVED';
    }

    // Get conversations with guest and property info
    let conversations = await prisma.conversation.findMany({
      where,
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            email: true,
            phone: true,
            emailVerified: true,
            guestProfile: {
              select: {
                totalBookings: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastMessageAt: 'desc' }
      ]
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      conversations = conversations.filter(conv => {
        const guestName = `${conv.guest.firstName} ${conv.guest.lastName}`.toLowerCase();
        return guestName.includes(searchLower);
      });
    }

    // Get property and booking info for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        let property = null;
        let booking = null;

        if (conv.propertyId) {
          property = await prisma.property.findUnique({
            where: { id: conv.propertyId },
            select: { id: true, title: true, city: true }
          });
        }

        if (conv.bookingId) {
          booking = await prisma.booking.findUnique({
            where: { id: conv.bookingId },
            select: {
              id: true,
              confirmationCode: true,
              checkIn: true,
              checkOut: true,
              guests: true,
              totalPrice: true,
              status: true
            }
          });
        }

        return {
          id: conv.id,
          guest: {
            id: conv.guest.id,
            name: `${conv.guest.firstName} ${conv.guest.lastName}`,
            avatar: conv.guest.profilePhoto,
            location: '', // TODO: Add location from guest profile
            memberSince: '', // TODO: Calculate from createdAt
            reviews: conv.guest.guestProfile?.totalBookings || 0,
            verified: conv.guest.emailVerified
          },
          property: property ? {
            id: property.id,
            name: property.title,
            location: property.city
          } : null,
          booking: booking ? {
            id: booking.id,
            confirmationCode: booking.confirmationCode,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            guests: booking.guests,
            totalAmount: booking.totalPrice,
            status: booking.status
          } : null,
          lastMessage: {
            text: conv.lastMessageText || '',
            timestamp: conv.lastMessageAt?.toISOString() || new Date().toISOString(),
            isFromGuest: conv.lastMessageFrom === 'guest',
            isRead: conv.unreadCountHost === 0
          },
          unreadCount: conv.unreadCountHost,
          isStarred: conv.isStarredByHost,
          isPinned: conv.isPinned,
          status: conv.status,
          requiresAction: booking?.status === 'PENDING'
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: conversationsWithDetails
    });

  } catch (error: any) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
