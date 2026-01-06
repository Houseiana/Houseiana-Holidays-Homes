import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export interface DataRequest {
  id: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  estimatedReadyAt: string;
  downloadUrl?: string;
  expiresAt?: string;
}

/**
 * GET /api/account/data-request
 * Get status of data request
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
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    const dataRequest: DataRequest | null = metadata.dataRequest || null;

    // Check if request has expired (mock - 7 days for download)
    if (dataRequest && dataRequest.expiresAt) {
      const expiresAt = new Date(dataRequest.expiresAt);
      if (expiresAt < new Date()) {
        dataRequest.status = 'expired';
      }
    }

    return NextResponse.json({
      success: true,
      data: dataRequest,
    });
  } catch (error) {
    console.error('Error fetching data request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data request status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/data-request
 * Request personal data export (GDPR)
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

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    // Check for existing pending request
    const existingRequest: DataRequest | null = metadata.dataRequest || null;
    if (existingRequest && existingRequest.status === 'pending') {
      return NextResponse.json({
        success: false,
        error: 'A data request is already pending',
        data: existingRequest,
      }, { status: 400 });
    }

    // Create new data request
    const now = new Date();
    const estimatedReady = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const newRequest: DataRequest = {
      id: `dr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestedAt: now.toISOString(),
      status: 'pending',
      estimatedReadyAt: estimatedReady.toISOString(),
    };

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        dataRequest: newRequest,
      },
    });

    // In production, this would trigger a background job to compile user data
    // For now, we simulate by setting a timeout to mark it ready (in real app, use a job queue)

    // Simulate processing (in production, this would be a background job)
    setTimeout(async () => {
      try {
        const refreshedUser = await clerk.users.getUser(userId);
        const refreshedMetadata = (refreshedUser.publicMetadata || {}) as Record<string, any>;
        const currentRequest: DataRequest | null = refreshedMetadata.dataRequest;

        if (currentRequest && currentRequest.id === newRequest.id) {
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days to download

          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...refreshedMetadata,
              dataRequest: {
                ...currentRequest,
                status: 'ready',
                downloadUrl: `/api/account/data-request/download?requestId=${newRequest.id}`,
                expiresAt: expiresAt.toISOString(),
              },
            },
          });
        }
      } catch (e) {
        console.error('Error updating data request status:', e);
      }
    }, 5000); // Simulate 5 second processing for demo

    return NextResponse.json({
      success: true,
      message: 'Data request submitted. We\'ll email you when your data is ready to download.',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error creating data request:', error);
    return NextResponse.json(
      { error: 'Failed to create data request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/data-request
 * Cancel data request
 */
export async function DELETE() {
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
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    if (!metadata.dataRequest) {
      return NextResponse.json({
        success: false,
        error: 'No data request found',
      }, { status: 404 });
    }

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        dataRequest: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data request cancelled',
    });
  } catch (error) {
    console.error('Error cancelling data request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel data request' },
      { status: 500 }
    );
  }
}
