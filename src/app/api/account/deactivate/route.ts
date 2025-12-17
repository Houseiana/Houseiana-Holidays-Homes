import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * POST /api/account/deactivate
 * Deactivates the user's account by:
 * 1. Marking user as inactive in Clerk metadata
 * 2. Signing out all sessions
 * 3. Notifying backend to hide user data
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reason } = await request.json().catch(() => ({ reason: '' }));

    console.log('🔒 Deactivating account for user:', userId);

    const clerk = await clerkClient();

    // Update user metadata to mark as deactivated
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        accountStatus: 'deactivated',
        deactivatedAt: new Date().toISOString(),
        deactivationReason: reason || 'User requested',
      },
    });

    // Get all sessions for this user and revoke them
    const sessions = await clerk.sessions.getSessionList({ userId });

    for (const session of sessions.data) {
      if (session.status === 'active') {
        await clerk.sessions.revokeSession(session.id);
      }
    }

    // Notify backend API about deactivation (optional - for hiding listings, etc.)
    const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

    try {
      await fetch(`${BACKEND_API_URL}/api/users/${userId}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch (backendError) {
      // Log but don't fail - Clerk deactivation is the primary action
      console.warn('Backend notification failed:', backendError);
    }

    console.log('✅ Account deactivated successfully');

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully. You can reactivate by logging in again.',
    });

  } catch (error) {
    console.error('Error deactivating account:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    );
  }
}
