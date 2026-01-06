import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export interface ConnectedService {
  id: string;
  name: string;
  email: string | null;
  connected: boolean;
  icon: 'google' | 'facebook' | 'apple';
  connectedAt?: string;
}

/**
 * GET /api/account/connected-services
 * Returns user's connected OAuth services
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

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Get external accounts from Clerk
    const externalAccounts = user.externalAccounts || [];

    // Map external accounts to our format
    const connectedServices: ConnectedService[] = [
      {
        id: 'google',
        name: 'Google',
        email: null,
        connected: false,
        icon: 'google',
      },
      {
        id: 'facebook',
        name: 'Facebook',
        email: null,
        connected: false,
        icon: 'facebook',
      },
      {
        id: 'apple',
        name: 'Apple',
        email: null,
        connected: false,
        icon: 'apple',
      },
    ];

    // Update with actual connected services
    for (const account of externalAccounts) {
      const provider = account.provider?.toLowerCase();
      const serviceIndex = connectedServices.findIndex(s =>
        s.id === provider ||
        (provider === 'oauth_google' && s.id === 'google') ||
        (provider === 'oauth_facebook' && s.id === 'facebook') ||
        (provider === 'oauth_apple' && s.id === 'apple')
      );

      if (serviceIndex !== -1) {
        connectedServices[serviceIndex] = {
          ...connectedServices[serviceIndex],
          email: account.emailAddress || null,
          connected: true,
          connectedAt: (account.verification as any)?.verifiedAtClient
            ? new Date((account.verification as any).verifiedAtClient).toISOString()
            : undefined,
        };
      }
    }

    // Also check public metadata for manually stored connections
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const storedConnections = metadata.connectedServices || {};

    for (const service of connectedServices) {
      if (storedConnections[service.id] && !service.connected) {
        service.connected = storedConnections[service.id].connected || false;
        service.email = storedConnections[service.id].email || null;
        service.connectedAt = storedConnections[service.id].connectedAt;
      }
    }

    return NextResponse.json({
      success: true,
      data: connectedServices,
    });
  } catch (error) {
    console.error('Error fetching connected services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connected services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/connected-services
 * Initiate OAuth connection (stores intent, actual OAuth is handled by Clerk)
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
    const { serviceId } = body;

    if (!serviceId || !['google', 'facebook', 'apple'].includes(serviceId)) {
      return NextResponse.json(
        { error: 'Valid service ID is required (google, facebook, or apple)' },
        { status: 400 }
      );
    }

    // Return the OAuth URL for the frontend to redirect to
    // In production, this would integrate with Clerk's OAuth flow
    const oauthUrls: Record<string, string> = {
      google: '/api/auth/oauth/google',
      facebook: '/api/auth/oauth/facebook',
      apple: '/api/auth/oauth/apple',
    };

    return NextResponse.json({
      success: true,
      message: `Please complete ${serviceId} authentication`,
      data: {
        serviceId,
        oauthUrl: oauthUrls[serviceId],
        // For demo purposes, simulate a successful connection
        redirectTo: `/account/privacy?connected=${serviceId}`,
      },
    });
  } catch (error) {
    console.error('Error initiating service connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/connected-services?serviceId=xxx
 * Disconnect a service
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId || !['google', 'facebook', 'apple'].includes(serviceId)) {
      return NextResponse.json(
        { error: 'Valid service ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Try to find and remove the external account
    const externalAccounts = user.externalAccounts || [];
    const accountToRemove = externalAccounts.find((a: { id: string; provider?: string }) => {
      const provider = a.provider?.toLowerCase();
      return provider === serviceId ||
        provider === `oauth_${serviceId}`;
    });

    if (accountToRemove) {
      try {
        // Delete external account from Clerk
        await clerk.users.deleteUserExternalAccount({
          userId,
          externalAccountId: accountToRemove.id,
        });
      } catch (clerkError) {
        console.warn('Could not delete Clerk external account:', clerkError);
        // Continue to update metadata
      }
    }

    // Update metadata to mark as disconnected
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const connectedServices = metadata.connectedServices || {};

    connectedServices[serviceId] = {
      connected: false,
      email: null,
      disconnectedAt: new Date().toISOString(),
    };

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        connectedServices,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${serviceId} disconnected successfully`,
    });
  } catch (error) {
    console.error('Error disconnecting service:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect service' },
      { status: 500 }
    );
  }
}
