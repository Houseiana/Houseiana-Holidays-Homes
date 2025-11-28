import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/guest/conversations - Get all conversations for the authenticated guest
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

    // Get all conversations where user is the guest
    const conversations = await prisma.conversation.findMany({
      where: {
        guestId: user.id,
        status: { not: 'ARCHIVED' }
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
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

    // Get property titles for conversations that have propertyId
    const propertyIds = conversations
      .map(c => c.propertyId)
      .filter(id => id !== null);

    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { id: true, title: true }
    });

    const propertyMap = new Map(properties.map(p => [p.id, p.title]));

    return NextResponse.json({
      success: true,
      data: conversations.map(conv => ({
        id: conv.id,
        hostId: conv.host.id,
        hostName: `${conv.host.firstName || ''} ${conv.host.lastName || ''}`.trim() || 'Host',
        hostAvatar: conv.host.profileImage || conv.host.firstName?.charAt(0).toUpperCase() || 'H',
        propertyTitle: conv.propertyId ? propertyMap.get(conv.propertyId) || 'Property' : 'General Inquiry',
        lastMessage: conv.lastMessageText || '',
        lastMessageTime: conv.lastMessageAt
          ? formatTimeAgo(conv.lastMessageAt)
          : '',
        unread: conv.unreadCountGuest > 0
      }))
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

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
