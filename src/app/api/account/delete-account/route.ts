import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

/**
 * POST /api/account/delete-account
 * Permanently delete user account (GDPR right to erasure)
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

    const body = await request.json();
    const { confirmText, reason } = body;

    // Verify confirmation
    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Check for active bookings (if backend supports this)
    try {
      const bookingsResponse = await fetch(
        `${BACKEND_API_URL}/booking-manager/user/${userId}?role=guest`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const activeBookings = (bookingsData || []).filter((b: any) =>
          ['CONFIRMED', 'AWAITING_PAYMENT', 'PENDING'].includes(b.status)
        );

        if (activeBookings.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete account with active bookings. Please cancel or complete all bookings first.',
            data: {
              activeBookingsCount: activeBookings.length,
            },
          }, { status: 400 });
        }
      }
    } catch (backendError) {
      console.warn('Could not verify bookings:', backendError);
      // Continue with deletion if backend is unavailable
    }

    // Check for pending payouts (if user is a host)
    try {
      const payoutsResponse = await fetch(
        `${BACKEND_API_URL}/api/payouts?userId=${userId}&status=pending`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json();
        const pendingPayouts = payoutsData.payouts || [];

        if (pendingPayouts.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete account with pending payouts. Please withdraw all pending funds first.',
            data: {
              pendingPayoutsCount: pendingPayouts.length,
            },
          }, { status: 400 });
        }
      }
    } catch (backendError) {
      console.warn('Could not verify payouts:', backendError);
    }

    // Store deletion record before deleting (for audit trail)
    const deletionRecord = {
      userId,
      email: user.emailAddresses[0]?.emailAddress,
      reason: reason || 'User requested deletion',
      deletedAt: new Date().toISOString(),
    };

    // Log deletion to backend audit trail
    try {
      await fetch(`${BACKEND_API_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'User',
          entityId: userId,
          action: 'ACCOUNT_DELETED',
          actorId: userId,
          actorType: 'user',
          metadata: deletionRecord,
        }),
      });
    } catch (auditError) {
      console.warn('Could not create audit log:', auditError);
    }

    // Notify backend to anonymize/delete user data
    try {
      await fetch(`${BACKEND_API_URL}/api/users/${userId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch (backendDeleteError) {
      console.warn('Backend user deletion failed:', backendDeleteError);
      // Continue - Clerk deletion is the primary action
    }

    // Delete user from Clerk
    try {
      await clerk.users.deleteUser(userId);
    } catch (clerkError) {
      console.error('Clerk user deletion failed:', clerkError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please try again or contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your account has been permanently deleted.',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/account/delete-account
 * Get account deletion requirements/status
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let activeBookingsCount = 0;
    let pendingPayoutsCount = 0;
    let canDelete = true;
    const blockers: string[] = [];

    // Check active bookings
    try {
      const bookingsResponse = await fetch(
        `${BACKEND_API_URL}/booking-manager/user/${userId}?role=guest`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        activeBookingsCount = (bookingsData || []).filter((b: any) =>
          ['CONFIRMED', 'AWAITING_PAYMENT', 'PENDING'].includes(b.status)
        ).length;

        if (activeBookingsCount > 0) {
          canDelete = false;
          blockers.push(`${activeBookingsCount} active booking(s)`);
        }
      }
    } catch {
      // Continue
    }

    // Check pending payouts
    try {
      const payoutsResponse = await fetch(
        `${BACKEND_API_URL}/api/payouts?userId=${userId}&status=pending`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json();
        pendingPayoutsCount = (payoutsData.payouts || []).length;

        if (pendingPayoutsCount > 0) {
          canDelete = false;
          blockers.push(`${pendingPayoutsCount} pending payout(s)`);
        }
      }
    } catch {
      // Continue
    }

    return NextResponse.json({
      success: true,
      data: {
        canDelete,
        blockers,
        requirements: [
          'Cancel any upcoming reservations',
          'Withdraw any pending payouts',
          'Download a copy of your data (recommended)',
        ],
        warning: 'This action is permanent and cannot be undone. All your data will be deleted.',
      },
    });
  } catch (error) {
    console.error('Error checking deletion requirements:', error);
    return NextResponse.json(
      { error: 'Failed to check deletion requirements' },
      { status: 500 }
    );
  }
}
