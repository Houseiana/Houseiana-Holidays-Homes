import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export interface PrivacySettings {
  // Sharing & Activity
  shareActivityWithPartners: boolean;
  includeInSearchEngines: boolean;
  showProfileToHosts: boolean;
  shareLocationWithHosts: boolean;
  // Personalization
  personalizedRecommendations: boolean;
  personalizedAds: boolean;
  usageAnalytics: boolean;
  // Third-party
  shareWithThirdParties: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  shareActivityWithPartners: false,
  includeInSearchEngines: true,
  showProfileToHosts: true,
  shareLocationWithHosts: true,
  personalizedRecommendations: true,
  personalizedAds: false,
  usageAnalytics: true,
  shareWithThirdParties: false,
};

/**
 * GET /api/account/privacy-settings
 * Returns user's privacy settings
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

    // Return saved settings or defaults
    const privacySettings: PrivacySettings = metadata.privacySettings || DEFAULT_PRIVACY_SETTINGS;

    return NextResponse.json({
      success: true,
      data: privacySettings,
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/privacy-settings
 * Update privacy settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { setting, value } = body;

    // Validate the setting key
    const validSettings = Object.keys(DEFAULT_PRIVACY_SETTINGS);
    if (!validSettings.includes(setting)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }

    if (typeof value !== 'boolean') {
      return NextResponse.json(
        { error: 'Value must be a boolean' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;
    const currentSettings: PrivacySettings = metadata.privacySettings || DEFAULT_PRIVACY_SETTINGS;

    // Update the specific setting
    const updatedSettings: PrivacySettings = {
      ...currentSettings,
      [setting]: value,
    };

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        privacySettings: updatedSettings,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Privacy setting updated',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/account/privacy-settings
 * Replace all privacy settings at once
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Validate all settings
    const validSettings = Object.keys(DEFAULT_PRIVACY_SETTINGS);
    for (const key of Object.keys(settings)) {
      if (!validSettings.includes(key)) {
        return NextResponse.json(
          { error: `Invalid setting key: ${key}` },
          { status: 400 }
        );
      }
      if (typeof settings[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Value for ${key} must be a boolean` },
          { status: 400 }
        );
      }
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    // Merge with defaults to ensure all keys exist
    const updatedSettings: PrivacySettings = {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...settings,
    };

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        privacySettings: updatedSettings,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}
