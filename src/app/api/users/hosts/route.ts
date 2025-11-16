import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma-client';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/users/hosts
 * Get list of hosts (property owners) for messaging
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch users who are hosts (have properties)
    const hosts = await prisma.user.findMany({
      where: {
        isHost: true,
        properties: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
        avatar: true,
        properties: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            title: true,
          },
          take: 3 // Show first 3 properties
        }
      },
      orderBy: {
        memberSince: 'desc'
      },
      take: 50 // Limit to 50 hosts
    });

    return NextResponse.json({
      success: true,
      data: hosts.map(host => ({
        id: host.id,
        name: `${host.firstName} ${host.lastName}`,
        firstName: host.firstName,
        lastName: host.lastName,
        photo: host.profilePhoto || host.avatar,
        properties: host.properties,
      })),
    });
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch hosts',
      },
      { status: 500 }
    );
  }
}
