/**
 * Users API Route (v2 - Using OOP Architecture)
 * Demonstrates: Clean Architecture, Dependency Injection, Service Layer Usage
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserService } from '@/infrastructure/di/Container';
import { CreateUserDTO } from '@/application/services/UserService';
import { UserRole } from '@/domain/entities/User';

/**
 * GET /api/v2/users
 * Search users or get users by role
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userService = getUserService();

    // Search by query
    const query = searchParams.get('q');
    if (query) {
      const users = await userService.searchUsers(query);
      return NextResponse.json({
        success: true,
        data: users.map(u => u.toJSON()),
      });
    }

    // Get users by role
    const role = searchParams.get('role');
    if (role) {
      const users = await userService.getUsersByRole(role as UserRole);
      return NextResponse.json({
        success: true,
        data: users.map(u => u.toJSON()),
      });
    }

    // Get verified hosts
    const verifiedHosts = searchParams.get('verifiedHosts');
    if (verifiedHosts === 'true') {
      const users = await userService.getVerifiedHosts();
      return NextResponse.json({
        success: true,
        data: users.map(u => u.toJSON()),
      });
    }

    // Get inactive users
    const inactive = searchParams.get('inactive');
    if (inactive === 'true') {
      const daysInactive = parseInt(searchParams.get('days') || '90');
      const users = await userService.getInactiveUsers(daysInactive);
      return NextResponse.json({
        success: true,
        data: users.map(u => u.toJSON()),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Please provide query parameters: q (search), role, verifiedHosts, or inactive'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v2/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName || !body.clerkId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: email, firstName, lastName, clerkId'
        },
        { status: 400 }
      );
    }

    // Create DTO
    const dto: CreateUserDTO = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      countryCode: body.countryCode,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      clerkId: body.clerkId,
    };

    // Get service from DI container
    const userService = getUserService();

    // Create user using service
    const user = await userService.createUser(dto);

    return NextResponse.json({
      success: true,
      data: user.toJSON(),
      message: 'User created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user'
      },
      { status: 500 }
    );
  }
}
