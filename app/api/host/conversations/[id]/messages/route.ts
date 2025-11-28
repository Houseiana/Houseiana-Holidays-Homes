import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// POST /api/host/conversations/[id]/messages - Send a new message
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message text is required' },
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

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        senderRole: 'host',
        text: text.trim(),
        status: 'sent'
      }
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: text.trim().substring(0, 100),
        lastMessageAt: new Date(),
        lastMessageFrom: 'host',
        unreadCountGuest: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        senderId: message.senderId,
        senderName: 'You',
        text: message.text,
        timestamp: message.createdAt.toISOString(),
        isFromGuest: false,
        status: message.status
      }
    });

  } catch (error: any) {
    console.error('Send message error:', error);
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

// PATCH /api/host/conversations/[id]/messages - Mark messages as read
export async function PATCH(
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

    // Mark all guest messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderRole: 'guest',
        status: { not: 'read' }
      },
      data: {
        status: 'read',
        readAt: new Date()
      }
    });

    // Reset unread count
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCountHost: 0 }
    });

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error: any) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark messages as read',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
