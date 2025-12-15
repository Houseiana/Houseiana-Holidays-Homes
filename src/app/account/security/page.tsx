'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Home, Globe, Menu, ChevronLeft, ChevronRight, Lock, Smartphone, Monitor, Shield, Key, LogOut, AlertTriangle, Check, X, Eye, EyeOff, Mail, Chrome, Apple, ExternalLink } from 'lucide-react';

export default function LoginSecurityPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  // Mock device sessions - In production, you'd fetch this from your backend or Clerk's session management
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on MacOS',
      location: 'Doha, Qatar',
      lastActive: 'Active now',
      isCurrent: true,
      icon: 'chrome',
    },
    {
      id: 2,
      device: 'Houseiana App on iPhone',
      location: 'Doha, Qatar',
      lastActive: '2 hours ago',
      isCurrent: false,
      icon: 'mobile',
    },
  ];

  // Get connected OAuth accounts from Clerk
  const connectedAccounts = user?.externalAccounts || [];
  const hasGoogleAccount = connectedAccounts.some((acc: any) => acc.provider === 'google');
  const hasAppleAccount = connectedAccounts.some((acc: any) => acc.provider === 'apple');

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'chrome':
        return <Chrome className="w-6 h-6 text-gray-600" />;
      case 'mobile':
        return <Smartphone className="w-6 h-6 text-gray-600" />;
      case 'safari':
        return <Monitor className="w-6 h-6 text-gray-600" />;
      default:
        return <Monitor className="w-6 h-6 text-gray-600" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'Google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'Apple':
        return <Apple className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleOpenUserProfile = () => {
    // Open Clerk's user profile component for password and 2FA management
    clerk.openUserProfile();
  };

  const handleLogoutAllSessions = async () => {
    try {
      // Sign out from all sessions
      await clerk.signOut({ sessionId: 'all' });
      setShowLogoutAllModal(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeactivateAccount = () => {
    // In production, you'd call your API to deactivate the account
    // For now, we'll just close the modal
    setShowDeactivateModal(false);
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/host-dashboard/add-listing">
                <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                  List your home
                </button>
              </Link>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{userAvatar}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/client-dashboard?tab=account" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Account
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Login & security</h1>
        <p className="text-gray-500 mb-8">Update your password and secure your account.</p>

        {/* Login Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Login</h2>

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
                  <p className="text-gray-600 mb-6">To enable two-factor authentication, please download an authenticator app like &quot;Google Authenticator&quot; or &quot;Authy&quot; on your phone.</p>
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
        </section>

        {/* Social Accounts Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Social accounts</h2>

          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {/* Google */}
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getProviderIcon('Google')}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Google</h3>
                    {hasGoogleAccount ? (
                      <p className="text-gray-500 text-sm">
                        {connectedAccounts.find((acc: any) => acc.provider === 'google')?.emailAddress}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">Not connected</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleOpenUserProfile}
                  className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                >
                  {hasGoogleAccount ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>

            {/* Apple */}
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getProviderIcon('Apple')}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Apple</h3>
                    {hasAppleAccount ? (
                      <p className="text-gray-500 text-sm">
                        {connectedAccounts.find((acc: any) => acc.provider === 'apple')?.emailAddress}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">Not connected</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleOpenUserProfile}
                  className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                >
                  {hasAppleAccount ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
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
        </section>

        {/* Device History Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Device history</h2>
            <button
              onClick={() => setShowLogoutAllModal(true)}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Log out of all devices
            </button>
          </div>

          <div className="space-y-0 divide-y divide-gray-200 border-t border-b border-gray-200">
            {activeSessions.map((session) => (
              <div key={session.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getDeviceIcon(session.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-medium">{session.device}</h3>
                        {session.isCurrent && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                            This device
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">{session.location} · {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={handleOpenUserProfile}
                      className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Session Management</p>
                <p className="text-blue-700">
                  Active sessions and devices are managed by Clerk&apos;s secure authentication system. For detailed session management, click &quot;Manage&quot; above.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account</h2>

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
        </section>

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
      {showLogoutAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutAllModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Log out of all devices?</h2>
              <p className="text-gray-600 mb-6">
                You&apos;ll be logged out of all devices and sessions. You&apos;ll need to sign in again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutAllModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutAllSessions}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                >
                  Log out all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeactivateModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Deactivate your account?</h2>
              <p className="text-gray-600 mb-4">
                Your profile, listings, reviews, and everything else associated with your account will be hidden until you reactivate.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>You can reactivate anytime by logging in</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Active reservations won&apos;t be affected</span>
                </li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivateAccount}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                <Globe className="w-4 h-4" />
                English (US)
              </button>
              <span className="text-sm font-medium">$ USD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
