'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Globe, Menu } from 'lucide-react';

interface AccountHeaderProps {
  userAvatar?: string;
  userName?: string;
}

export function AccountHeader({ userAvatar = 'U', userName }: AccountHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
          </Link>

          {/* Right Menu */}
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
  );
}
