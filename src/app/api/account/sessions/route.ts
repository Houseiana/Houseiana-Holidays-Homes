import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { Session } from '@clerk/nextjs/server';

/**
 * GET /api/account/sessions
 * Returns all active sessions for the current user with device info
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId: currentSessionId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();

    // Get all sessions for this user
    const sessionsResponse = await clerk.sessions.getSessionList({ userId });
    const sessions = sessionsResponse.data;

    // Transform sessions to a user-friendly format
    const activeSessions = sessions
      .filter((session: Session) => session.status === 'active')
      .map((session: Session) => {
        // Parse user agent for device info
        const userAgent = session.lastActiveAt ? parseUserAgent((session as any).latestActivity?.deviceType || '') : '';

        const activity = (session as any).latestActivity;
        return {
          id: session.id,
          device: formatDeviceName(activity?.deviceType, activity?.browserName),
          browser: activity?.browserName || 'Unknown browser',
          os: activity?.deviceType || 'Unknown',
          location: formatLocation(activity?.city, activity?.country),
          ipAddress: activity?.ipAddress || '',
          lastActive: formatLastActive(session.lastActiveAt),
          lastActiveAt: session.lastActiveAt,
          isCurrent: session.id === currentSessionId,
          icon: getDeviceIcon(activity?.deviceType, activity?.browserName),
          createdAt: session.createdAt,
        };
      })
      .sort((a: { isCurrent: boolean; lastActiveAt: number }, b: { isCurrent: boolean; lastActiveAt: number }) => {
        // Current session first, then by last active
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
      });

    return NextResponse.json({
      success: true,
      sessions: activeSessions,
      totalSessions: activeSessions.length,
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/sessions
 * Revokes a specific session or all sessions except current
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, sessionId: currentSessionId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetSessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('all') === 'true';

    const clerk = await clerkClient();

    if (revokeAll) {
      // Revoke all sessions except current
      const sessionsResponse = await clerk.sessions.getSessionList({ userId });
      const sessions = sessionsResponse.data;

      let revokedCount = 0;
      for (const session of sessions) {
        if (session.id !== currentSessionId && session.status === 'active') {
          await clerk.sessions.revokeSession(session.id);
          revokedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} session(s)`,
        revokedCount,
      });
    }

    if (targetSessionId) {
      // Prevent revoking current session through this endpoint
      if (targetSessionId === currentSessionId) {
        return NextResponse.json(
          { error: 'Cannot revoke current session. Use sign out instead.' },
          { status: 400 }
        );
      }

      await clerk.sessions.revokeSession(targetSessionId);

      return NextResponse.json({
        success: true,
        message: 'Session revoked successfully',
      });
    }

    return NextResponse.json(
      { error: 'Session ID or all=true parameter required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseUserAgent(deviceType: string): string {
  return deviceType || 'Unknown device';
}

function formatDeviceName(deviceType?: string, browserName?: string): string {
  const browser = browserName || 'Browser';
  const device = deviceType || 'Device';

  if (deviceType?.toLowerCase().includes('mobile') || deviceType?.toLowerCase().includes('iphone')) {
    return `Houseiana on ${device}`;
  }

  return `${browser} on ${device}`;
}

function formatLocation(city?: string, country?: string): string {
  if (city && country) {
    return `${city}, ${country}`;
  }
  if (country) {
    return country;
  }
  return 'Unknown location';
}

function formatLastActive(lastActiveAt: number): string {
  if (!lastActiveAt) return 'Unknown';

  const now = Date.now();
  const diff = now - lastActiveAt;

  // Less than 5 minutes
  if (diff < 5 * 60 * 1000) {
    return 'Active now';
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Format as date
  return new Date(lastActiveAt).toLocaleDateString();
}

function getDeviceIcon(deviceType?: string, browserName?: string): string {
  const browser = browserName?.toLowerCase() || '';
  const device = deviceType?.toLowerCase() || '';

  if (device.includes('mobile') || device.includes('iphone') || device.includes('android')) {
    return 'mobile';
  }

  if (browser.includes('chrome')) {
    return 'chrome';
  }

  if (browser.includes('safari')) {
    return 'safari';
  }

  if (browser.includes('firefox')) {
    return 'firefox';
  }

  return 'desktop';
}
