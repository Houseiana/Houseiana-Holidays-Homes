import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// PATCH /api/host/conversations/[id]/actions - Perform actions on conversation
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

    // Parse request body
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
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

    // Perform action
    let updateData: any = {};

    switch (action) {
      case 'pin':
        updateData = { isPinned: true };
        break;
      case 'unpin':
        updateData = { isPinned: false };
        break;
      case 'star':
        updateData = { isStarredByHost: true };
        break;
      case 'unstar':
        updateData = { isStarredByHost: false };
        break;
      case 'archive':
        updateData = { status: 'ARCHIVED' };
        break;
      case 'unarchive':
        updateData = { status: 'ACTIVE' };
        break;
      case 'close':
        updateData = { status: 'CLOSED' };
        break;
      case 'reopen':
        updateData = { status: 'ACTIVE' };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `Conversation ${action}ed successfully`,
      data: {
        id: updatedConversation.id,
        status: updatedConversation.status,
        isPinned: updatedConversation.isPinned,
        isStarredByHost: updatedConversation.isStarredByHost
      }
    });

  } catch (error: any) {
    console.error('Conversation action error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform action',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
