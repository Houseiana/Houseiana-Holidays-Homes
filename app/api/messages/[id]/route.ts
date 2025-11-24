import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get authenticated user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // In production, verify JWT token here
    // For now, using simple token lookup from User table
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token },
          // Allow auth by email for testing
          { email: token }
        ]
      }
    });

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// GET /api/messages/[id] - Get or create conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const hostId = params.id;

    // Get or create conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        userId: user.id,
        metadata: {
          path: ['hostId'],
          equals: hostId
        }
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.chatConversation.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          metadata: {
            hostId,
            startedAt: new Date().toISOString()
          }
        }
      });
    }

    // Get all messages in this conversation
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: conversation.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get host info
    const host = await prisma.user.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePhoto: true
      }
    });

    // Return conversation with messages
    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          hostId,
          hostName: host ? `${host.firstName} ${host.lastName}` : 'Host',
          hostAvatar: host?.profilePhoto || '',
          lastMessageAt: conversation.lastMessageAt?.toISOString() || new Date().toISOString(),
          status: conversation.status
        },
        messages: messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          senderType: msg.senderType,
          message: msg.message,
          createdAt: msg.createdAt.toISOString(),
          isRead: msg.isRead
        }))
      }
    });

  } catch (error: any) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/messages/[id] - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const hostId = params.id;

    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        userId: user.id,
        metadata: {
          path: ['hostId'],
          equals: hostId
        }
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.chatConversation.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          metadata: {
            hostId,
            startedAt: new Date().toISOString()
          }
        }
      });
    }

    // Create message
    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        senderType: 'USER',
        message: message.trim(),
        attachments: [],
        isRead: false
      }
    });

    // Update conversation lastMessageAt
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });

    // Return created message
    return NextResponse.json({
      success: true,
      data: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        senderType: newMessage.senderType,
        message: newMessage.message,
        createdAt: newMessage.createdAt.toISOString(),
        isRead: newMessage.isRead
      }
    });

  } catch (error: any) {
    console.error('Messages POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
