import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/host/message-templates/[id] - Get specific template
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

    // Get template
    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        title: template.title,
        content: template.content,
        category: template.category,
        variables: template.variables,
        usageCount: template.usageCount,
        lastUsedAt: template.lastUsedAt?.toISOString(),
        isActive: template.isActive,
        createdAt: template.createdAt.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Get template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/host/message-templates/[id] - Update template
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

    // Parse request body
    const body = await request.json();
    const { title, content, category, variables, isActive } = body;

    // Verify template belongs to user
    const existing = await prisma.messageTemplate.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (variables !== undefined) updateData.variables = variables;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update template
    const template = await prisma.messageTemplate.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        title: template.title,
        content: template.content,
        category: template.category,
        variables: template.variables,
        usageCount: template.usageCount,
        isActive: template.isActive,
        createdAt: template.createdAt.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Update template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update template',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/host/message-templates/[id] - Delete template
export async function DELETE(
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

    // Verify template belongs to user
    const existing = await prisma.messageTemplate.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete template
    await prisma.messageTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete template',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/host/message-templates/[id]/use - Mark template as used
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

    // Verify template belongs to user
    const existing = await prisma.messageTemplate.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update usage stats
    const template = await prisma.messageTemplate.update({
      where: { id: params.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        usageCount: template.usageCount,
        lastUsedAt: template.lastUsedAt?.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Update template usage error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update template usage',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
