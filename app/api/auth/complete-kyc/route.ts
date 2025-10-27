import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { firstName, lastName, idNumber, idCopy } = await request.json();

    // Validate input
    if (!firstName || !lastName || !idNumber || !idCopy) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Update user with KYC information
    const updatedUser = await (prisma as any).user.update({
      where: { id: user.userId },
      data: {
        firstName,
        lastName,
        idNumber,
        idCopy,
        kycCompleted: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isHost: true,
        kycCompleted: true
      }
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'KYC information saved successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isHost: updatedUser.isHost,
        hasCompletedKYC: true
      }
    });

  } catch (error) {
    console.error('KYC completion error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save KYC information' },
      { status: 500 }
    );
  }
}
