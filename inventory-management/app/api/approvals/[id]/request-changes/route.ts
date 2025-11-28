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
    const { changes, comments } = body;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Changes list is required and must not be empty',
        },
        { status: 400 }
      );
    }

    // Update property approval status to changes_requested
    const updatedProperty = await prisma.property.update({
      where: {
        id: id,
      },
      data: {
        approval_status: 'changes_requested',
        rejectionReason: `Changes requested: ${changes.join(', ')}${comments ? `\n\nAdditional comments: ${comments}` : ''}`,
        approvedAt: null, // Clear any previous approval
        updatedAt: new Date(),
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: 'admin', // TODO: Get from auth session
        action: 'REQUEST_CHANGES_PROPERTY',
        entityType: 'property',
        entityId: id,
        changes: {
          status: 'changes_requested',
          changes: changes,
          comments: comments || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProperty.id,
        status: updatedProperty.approval_status,
        requestedChanges: changes,
        comments: comments,
      },
      message: 'Changes requested successfully',
    });
  } catch (error: any) {
    console.error('Failed to request changes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to request changes',
      },
      { status: 500 }
    );
  }
}
