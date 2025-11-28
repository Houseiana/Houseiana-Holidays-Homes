import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/host/message-templates - Get all templates for the host
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') === 'true';

    // Build where clause
    const where: any = { userId: user.id };
    if (category) {
      where.category = category;
    }
    if (activeOnly) {
      where.isActive = true;
    }

    // Get templates
    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: templates.map(t => ({
        id: t.id,
        title: t.title,
        content: t.content,
        category: t.category,
        variables: t.variables,
        usageCount: t.usageCount,
        lastUsedAt: t.lastUsedAt?.toISOString(),
        isActive: t.isActive,
        createdAt: t.createdAt.toISOString()
      }))
    });

  } catch (error: any) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/host/message-templates - Create new template
export async function POST(request: NextRequest) {
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
    const { title, content, category, variables } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create template
    const template = await prisma.messageTemplate.create({
      data: {
        userId: user.id,
        title,
        content,
        category: category || 'custom',
        variables: variables || []
      }
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
    console.error('Create template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
