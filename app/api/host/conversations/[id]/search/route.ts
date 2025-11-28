import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/host/conversations/[id]/search - Search messages in conversation
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Verify conversation belongs to this host
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        hostId: user.id
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Search messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        text: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        count: messages.length,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          senderRole: msg.senderRole,
          createdAt: msg.createdAt.toISOString(),
          isFromGuest: msg.senderRole === 'guest'
        }))
      }
    });

  } catch (error: any) {
    console.error('Search messages error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search messages',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
