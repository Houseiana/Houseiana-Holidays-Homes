import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const HOUSEIANA_USER_ID = 'user_houseiana_system';

// GET /api/hosts - Search for hosts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      isHost: true, // Only fetch users who are hosts
    };

    // Search filter (search by ID, name, or email)
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch hosts from database
    const hosts = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        kycStatus: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to 20 results
    });

    return NextResponse.json({
      success: true,
      hosts: hosts.map((host) => ({
        id: host.id,
        firstName: host.firstName,
        lastName: host.lastName,
        fullName: `${host.firstName} ${host.lastName}`,
        email: host.email,
        phone: host.phone || '',
        profilePhoto: host.profilePhoto,
        kycStatus: host.kycStatus,
        propertyCount: host._count.properties,
        isHouseiana: host.id === HOUSEIANA_USER_ID,
      })),
    });
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch hosts',
      },
      { status: 500 }
    );
  }
}

// POST /api/hosts - Create new host user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, nationality } = body;

    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'First name, last name, and email are required',
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'A user with this email already exists',
        },
        { status: 400 }
      );
    }

    // Create new host user
    const host = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        firstName,
        lastName,
        email,
        phone: phone || null,
        countryCode: '+974', // Default to Qatar
        nationality: nationality || null,
        isGuest: false,
        isHost: true, // New user is a host
        isAdmin: false,
        isSuperAdmin: false,
        accountStatus: 'ACTIVE',
        emailVerified: false,
        phoneVerified: false,
        kycStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        host: {
          id: host.id,
          firstName: host.firstName,
          lastName: host.lastName,
          fullName: `${host.firstName} ${host.lastName}`,
          email: host.email,
          phone: host.phone,
          kycStatus: host.kycStatus,
        },
        message: 'Host created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating host:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create host',
      },
      { status: 500 }
    );
  }
}
