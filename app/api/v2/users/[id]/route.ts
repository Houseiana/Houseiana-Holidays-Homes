/**
 * Individual User API Route (v2 - Using OOP Architecture)
 * Handles operations on individual users
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserService } from '@/infrastructure/di/Container';
import { UpdateUserProfileDTO, UpdateHostProfileDTO } from '@/application/services/UserService';

/**
 * GET /api/v2/users/[id]
 * Get a specific user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Proxy to NestJS backend
    const response = await fetch(`http://localhost:3001/users/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const user = await response.json();

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Error fetching user from backend:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v2/users/[id]
 * Update user profile or perform actions (become host, verify, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    const userService = getUserService();

    // Handle user actions
    if (action === 'update-profile') {
      const updates: UpdateUserProfileDTO = {};

      if (body.firstName) updates.firstName = body.firstName;
      if (body.lastName) updates.lastName = body.lastName;
      if (body.avatar) updates.avatar = body.avatar;
      if (body.bio) updates.bio = body.bio;
      if (body.language) updates.language = body.language;
      if (body.currency) updates.currency = body.currency;

      const user = await userService.updateUserProfile(params.id, updates);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'Profile updated successfully',
      });

    } else if (action === 'become-host') {
      const user = await userService.becomeHost(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'User is now a host',
      });

    } else if (action === 'verify-email') {
      const user = await userService.verifyEmail(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'Email verified successfully',
      });

    } else if (action === 'verify-phone') {
      const user = await userService.verifyPhone(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'Phone verified successfully',
      });

    } else if (action === 'verify-id') {
      const user = await userService.completeIdVerification(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'ID verification completed successfully',
      });

    } else if (action === 'suspend') {
      const { reason } = body;
      if (!reason) {
        return NextResponse.json(
          { success: false, error: 'reason is required for suspension' },
          { status: 400 }
        );
      }

      const user = await userService.suspendUser(params.id, reason);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'User suspended successfully',
      });

    } else if (action === 'deactivate') {
      const user = await userService.deactivateUser(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'User deactivated successfully',
      });

    } else if (action === 'reactivate') {
      const user = await userService.reactivateUser(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'User reactivated successfully',
      });

    } else if (action === 'update-host-profile') {
      const updates: UpdateHostProfileDTO = {};

      if (body.bio) updates.bio = body.bio;
      if (body.responseTime !== undefined) updates.responseTime = body.responseTime;
      if (body.acceptanceRate !== undefined) updates.acceptanceRate = body.acceptanceRate;
      if (body.isSuperhost !== undefined) updates.isSuperhost = body.isSuperhost;

      const user = await userService.updateHostProfile(params.id, updates);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
        message: 'Host profile updated successfully',
      });

    } else if (action === 'update-last-login') {
      const user = await userService.updateLastLogin(params.id);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
      });

    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be one of: update-profile, become-host, verify-email, verify-phone, verify-id, suspend, deactivate, reactivate, update-host-profile, update-last-login'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating user:', error);

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
        error: 'Failed to update user'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v2/users/[id]
 * Delete a user account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userService = getUserService();
    await userService.deleteUser(params.id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting user:', error);

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
        error: 'Failed to delete user'
      },
      { status: 500 }
    );
  }
}
