'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Heart, User, Menu } from 'lucide-react';
import { useState } from 'react';

export function MobileNav() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { href: '/', icon: Home, label: 'Home', show: true },
    { href: '/discover', icon: Search, label: 'Explore', show: true },
    { href: '/client-dashboard?tab=wishlists', icon: Heart, label: 'Saved', show: true },
    { href: '/my-trips', icon: User, label: 'Trips', show: true },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-colors text-gray-600 hover:text-gray-900 active:bg-gray-100"
          >
            <Menu className="w-6 h-6 mb-1 stroke-2" />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* More Menu Modal - Mobile */}
      {showMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 safe-area-inset-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

            <div className="space-y-1">
              <Link
                href="/become-host"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Home className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Become a Host</span>
              </Link>

              <Link
                href="/host-dashboard"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Menu className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Host Dashboard</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Settings</span>
              </Link>

              <Link
                href="/help"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Help & Support</span>
              </Link>
            </div>

            <button
              onClick={() => setShowMenu(false)}
              className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium active:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add padding to body content to prevent bottom nav overlap */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: env(safe-area-inset-bottom, 70px);
          }
        }
      `}</style>
    </>
  );
}
