import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/host/conversations/[id] - Get specific conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const conversationId = params.id;

    // Get conversation with messages
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        hostId: user.id
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            emailVerified: true,
            guestProfile: {
              select: {
                totalBookings: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          where: { deletedAt: null }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get property and booking details
    let property = null;
    let booking = null;

    if (conversation.propertyId) {
      property = await prisma.property.findUnique({
        where: { id: conversation.propertyId },
        select: {
          id: true,
          title: true,
          city: true,
          coverPhoto: true
        }
      });
    }

    if (conversation.bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: conversation.bookingId },
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

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderRole: 'guest',
        status: { not: 'read' }
      },
      data: {
        status: 'read',
        readAt: new Date()
      }
    });

    // Reset unread count for host
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadCountHost: 0 }
    });

    // Format messages
    const messages = conversation.messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderRole === 'guest'
        ? `${conversation.guest.firstName} ${conversation.guest.lastName}`
        : 'You',
      text: msg.text,
      timestamp: msg.createdAt.toISOString(),
      isFromGuest: msg.senderRole === 'guest',
      isSystem: msg.isSystem,
      status: msg.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          guest: {
            id: conversation.guest.id,
            name: `${conversation.guest.firstName} ${conversation.guest.lastName}`,
            avatar: conversation.guest.profilePhoto,
            verified: conversation.guest.emailVerified,
            reviews: conversation.guest.guestProfile?.totalBookings || 0
          },
          property,
          booking: booking ? {
            id: booking.id,
            confirmationCode: booking.confirmationCode,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            guests: booking.guests,
            totalAmount: booking.totalPrice,
            status: booking.status
          } : null,
          status: conversation.status
        },
        messages
      }
    });

  } catch (error: any) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversation',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
