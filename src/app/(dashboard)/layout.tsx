/**
 * Dashboard Layout
 * Shared layout for all dashboard pages with sidebar navigation
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import ChatNotificationProvider from '@/components/notifications/ChatNotificationProvider';
import IntercomMessenger from '@/components/IntercomMessenger';

const guestNavItems = [
  { href: '/trips', label: 'My Trips', icon: '✈️' },
  { href: '/wishlist', label: 'Wishlist', icon: '❤️' },
  { href: '/explore', label: 'Explore', icon: '🔍' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/payments', label: 'Payments', icon: '💳' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/help-center', label: 'Support', icon: '🆘' },
];

const hostNavItems = [
  { href: '/host/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/host/properties', label: 'Properties', icon: '🏠' },
  { href: '/host/bookings', label: 'Bookings', icon: '📅' },
  { href: '/host/earnings', label: 'Earnings', icon: '💰' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/help-center', label: 'Support', icon: '🆘' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Determine if user is in host mode (this would normally come from user metadata)
  const isHostMode = pathname?.startsWith('/host');
  const navItems = isHostMode ? hostNavItems : guestNavItems;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <ChatNotificationProvider token={user.id} currentUserId={user.id}>
      <IntercomMessenger />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Houseiana
              </Link>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={() => {
                    const targetPath = isHostMode ? '/trips' : '/host/dashboard';
                    router.push(targetPath);
                  }}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isHostMode ? 'Switch to Guest' : 'Switch to Host'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                          ${
                            isActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Role Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Current Role:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {isHostMode ? '🏠 Host' : '🎯 Guest'}
                    </span>
                  </div>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ChatNotificationProvider>
  );
}
