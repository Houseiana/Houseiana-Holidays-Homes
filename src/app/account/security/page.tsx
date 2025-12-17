'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Shield, ExternalLink } from 'lucide-react';
import {
  AccountHeader,
  AccountFooter,
  AccountBreadcrumb,
  SecuritySection,
  DeviceSessionItem,
  SocialAccountItem,
  ConfirmModal,
} from '@/components/account';
import { AccountAPI } from '@/lib/backend-api';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  icon: string;
}

export default function LoginSecurityPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [showRevokeSessionModal, setShowRevokeSessionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Fetch real sessions from Clerk via our API
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const response = await AccountAPI.getSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  // Fetch sessions on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchSessions();
    }
  }, [isSignedIn, fetchSessions]);

  // Get connected OAuth accounts from Clerk
  const connectedAccounts = user?.externalAccounts || [];
  const googleAccount = connectedAccounts.find((acc: any) => acc.provider === 'google');
  const appleAccount = connectedAccounts.find((acc: any) => acc.provider === 'apple');

  const handleOpenUserProfile = () => {
    clerk.openUserProfile();
  };

  const handleLogoutAllSessions = async () => {
    try {
      // Use our API to revoke all other sessions
      const response = await AccountAPI.revokeAllOtherSessions();
      if (response.success) {
        // Then sign out current session
        await clerk.signOut();
        setShowLogoutAllModal(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRevokeSession = async () => {
    if (!selectedSessionId) return;

    try {
      const response = await AccountAPI.revokeSession(selectedSessionId);
      if (response.success) {
        // Refresh sessions list
        await fetchSessions();
        setShowRevokeSessionModal(false);
        setSelectedSessionId(null);
      }
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleManageSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowRevokeSessionModal(true);
  };

  const handleDeactivateAccount = async () => {
    try {
      setIsDeactivating(true);
      const response = await AccountAPI.deactivateAccount('User requested deactivation');

      if (response.success) {
        setShowDeactivateModal(false);
        // Redirect to home after deactivation
        router.push('/');
      } else {
        console.error('Deactivation failed:', response.error);
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
    } finally {
      setIsDeactivating(false);
    }
  };

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userAvatar = user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white">
      <AccountHeader userAvatar={userAvatar} />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AccountBreadcrumb />

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Login & security</h1>
        <p className="text-gray-500 mb-8">Update your password and secure your account.</p>

        {/* Login Section */}
        <SecuritySection title="Login">
          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {/* Password */}
            <div className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium">Password</h3>
                  <p className="text-gray-500 mt-1">Manage your password securely</p>
                </div>
                <button
                  onClick={handleOpenUserProfile}
                  className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 flex items-center gap-1"
                >
                  Update
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium">Two-factor authentication</h3>
                  <p className="text-gray-500 mt-1">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={handleOpenUserProfile}
                  className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 flex items-center gap-1"
                >
                  Manage
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </SecuritySection>

        {/* Social Accounts Section */}
        <SecuritySection title="Social accounts">
          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            <SocialAccountItem
              provider="Google"
              email={googleAccount?.emailAddress}
              isConnected={!!googleAccount}
              onAction={handleOpenUserProfile}
            />
            <SocialAccountItem
              provider="Apple"
              email={appleAccount?.emailAddress}
              isConnected={!!appleAccount}
              onAction={handleOpenUserProfile}
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Managed by Clerk</p>
                <p className="text-blue-700">
                  Social account connections are securely managed by Clerk. Click &quot;Manage&quot; or &quot;Connect&quot; to access Clerk&apos;s secure authentication portal.
                </p>
              </div>
            </div>
          </div>
        </SecuritySection>

        {/* Device History Section */}
        <SecuritySection
          title="Device history"
          headerAction={
            <button
              onClick={() => setShowLogoutAllModal(true)}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Log out of all devices
            </button>
          }
        >
          <div className="space-y-0 divide-y divide-gray-200 border-t border-b border-gray-200">
            {isLoadingSessions ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">No active sessions found</p>
              </div>
            ) : (
              sessions.map((session) => (
                <DeviceSessionItem
                  key={session.id}
                  session={{
                    id: typeof session.id === 'string' ? parseInt(session.id, 10) || 0 : session.id as unknown as number,
                    device: session.device,
                    location: session.location,
                    lastActive: session.lastActive,
                    isCurrent: session.isCurrent,
                    icon: session.icon,
                  }}
                  onManage={() => handleManageSession(session.id)}
                />
              ))
            )}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Real-time Session Data</p>
                <p className="text-blue-700">
                  Sessions are fetched in real-time from Clerk&apos;s authentication system. You can revoke any session except your current one.
                </p>
              </div>
            </div>
          </div>
        </SecuritySection>

        {/* Account Section */}
        <SecuritySection title="Account">
          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            <div className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium">Deactivate your account</h3>
                  <p className="text-gray-500 mt-1 text-sm">
                    Temporarily deactivate your account. You can reactivate anytime.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="text-sm font-semibold text-red-600 underline hover:text-red-700"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </SecuritySection>

        {/* Security Tips */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Let&apos;s make your account more secure</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                We&apos;re always working on ways to increase safety in our community. That&apos;s why we look at every account to make sure it&apos;s as secure as possible.
              </p>
              <button
                onClick={handleOpenUserProfile}
                className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
              >
                Learn more about security
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Logout All Devices Modal */}
      <ConfirmModal
        isOpen={showLogoutAllModal}
        onClose={() => setShowLogoutAllModal(false)}
        onConfirm={handleLogoutAllSessions}
        title="Log out of all devices?"
        description="You'll be logged out of all devices and sessions. You'll need to sign in again."
        confirmText="Log out all"
        variant="warning"
      />

      {/* Revoke Single Session Modal */}
      <ConfirmModal
        isOpen={showRevokeSessionModal}
        onClose={() => {
          setShowRevokeSessionModal(false);
          setSelectedSessionId(null);
        }}
        onConfirm={handleRevokeSession}
        title="Revoke this session?"
        description="This device will be logged out immediately and will need to sign in again to access your account."
        confirmText="Revoke session"
        variant="warning"
      />

      {/* Deactivate Account Modal */}
      <ConfirmModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivateAccount}
        title="Deactivate your account?"
        description="Your profile, listings, reviews, and everything else associated with your account will be hidden until you reactivate."
        confirmText={isDeactivating ? 'Deactivating...' : 'Deactivate'}
        variant="danger"
        bulletPoints={[
          'You can reactivate anytime by logging in',
          'Active reservations won\'t be affected',
        ]}
      />

      <AccountFooter />
    </div>
  );
}
