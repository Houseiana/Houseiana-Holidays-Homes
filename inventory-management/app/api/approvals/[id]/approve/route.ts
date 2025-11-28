import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { comments } = body;

    // Update property approval status to approved and publish it
    const updatedProperty = await prisma.property.update({
      where: {
        id: id,
      },
      data: {
        status: 'PUBLISHED', // Make property visible in search results
        approval_status: 'approved',
        approvedAt: new Date(),
        publishedAt: new Date(), // Record when property was published
        rejectionReason: null, // Clear any previous rejection reason
        updatedAt: new Date(),
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: 'admin', // TODO: Get from auth session
        action: 'APPROVE_PROPERTY',
        entityType: 'property',
        entityId: id,
        changes: {
          status: 'approved',
          comments: comments || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProperty.id,
        status: updatedProperty.approval_status,
        approvedAt: updatedProperty.approvedAt,
      },
      message: 'Property approved successfully',
    });
  } catch (error: any) {
    console.error('Failed to approve property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to approve property',
      },
      { status: 500 }
    );
  }
}
