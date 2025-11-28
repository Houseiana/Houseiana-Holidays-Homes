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

    if (!comments) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rejection reason is required',
        },
        { status: 400 }
      );
    }

    // Update property approval status to rejected
    const updatedProperty = await prisma.property.update({
      where: {
        id: id,
      },
      data: {
        approval_status: 'rejected',
        rejectionReason: comments,
        approvedAt: null, // Clear any previous approval
        updatedAt: new Date(),
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: 'admin', // TODO: Get from auth session
        action: 'REJECT_PROPERTY',
        entityType: 'property',
        entityId: id,
        changes: {
          status: 'rejected',
          reason: comments,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProperty.id,
        status: updatedProperty.approval_status,
        rejectionReason: updatedProperty.rejectionReason,
      },
      message: 'Property rejected successfully',
    });
  } catch (error: any) {
    console.error('Failed to reject property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reject property',
      },
      { status: 500 }
    );
  }
}
