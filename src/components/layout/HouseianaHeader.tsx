'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Home, Search, Heart, MessageSquare, User, Globe, Menu, X,
  Building2, CalendarDays, DollarSign, BarChart2, Settings,
  HelpCircle, LogOut, ChevronRight, Star, Bell, Plus,
  LayoutDashboard, BookOpen, FileText, Users, Sparkles,
  ArrowLeftRight, UserCircle, CreditCard, Shield, Gift
} from 'lucide-react';

interface HouseianaHeaderProps {
  unreadMessages?: number;
  notifications?: number;
}

export default function HouseianaHeader({
  unreadMessages = 0,
  notifications = 0,
}: HouseianaHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine current mode based on URL
  const currentMode = pathname?.startsWith('/host-dashboard') ? 'host' : 'guest';

  // Check if user is a host (has properties)
  // In production, this would come from your database
  const isHost = true; // TODO: Get from user metadata or database

  // Get user info
  const userInfo = {
    name: user?.fullName || user?.firstName || 'User',
    initials: user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U',
    avatar: user?.imageUrl,
    isVerified: true,
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  type MenuItem =
    | { type: 'link'; label: string; href: string; icon: any; highlight?: boolean }
    | { type: 'switch'; label: string; icon: any; highlight?: boolean }
    | { type: 'divider' };

  const guestMenuItems: MenuItem[] = [
    { type: 'link' as const, label: 'Dashboard', href: '/client-dashboard', icon: LayoutDashboard },
    { type: 'link' as const, label: 'Wishlists', href: '/wishlists', icon: Heart },
    { type: 'divider' as const },
    ...(isHost ? [
      { type: 'switch' as const, label: 'Switch to hosting', icon: ArrowLeftRight, highlight: true },
    ] : [
      { type: 'link' as const, label: 'List your home', href: '/host-dashboard/add-listing', icon: Building2, highlight: true },
    ]),
    { type: 'divider' as const },
    { type: 'link' as const, label: 'Account', href: '/account', icon: UserCircle },
    { type: 'link' as const, label: 'Help Center', href: '/help', icon: HelpCircle },
    { type: 'divider' as const },
    { type: 'link' as const, label: 'Log out', href: '/sign-out', icon: LogOut },
  ];

  const hostMenuItems: MenuItem[] = [
    { type: 'link' as const, label: 'Dashboard', href: '/host-dashboard', icon: LayoutDashboard },
    { type: 'link' as const, label: 'Listings', href: '/host-dashboard/listings', icon: Building2 },
    { type: 'link' as const, label: 'Reservations', href: '/host-dashboard/bookings', icon: CalendarDays },
    { type: 'link' as const, label: 'Earnings', href: '/host-dashboard/earnings', icon: DollarSign },
    { type: 'link' as const, label: 'Reviews', href: '/host-dashboard/reviews', icon: Star },
    { type: 'divider' as const },
    { type: 'switch' as const, label: 'Switch to traveling', icon: ArrowLeftRight, highlight: true },
    { type: 'divider' as const },
    { type: 'link' as const, label: 'Create a new listing', href: '/host-dashboard/add-listing', icon: Plus },
    { type: 'divider' as const },
    { type: 'link' as const, label: 'Account', href: '/account', icon: UserCircle },
    { type: 'link' as const, label: 'Help Center', href: '/help', icon: HelpCircle },
    { type: 'divider' as const },
    { type: 'link' as const, label: 'Log out', href: '/sign-out', icon: LogOut },
  ];

  const menuItems = currentMode === 'host' ? hostMenuItems : guestMenuItems;

  const handleMenuItemClick = (item: any) => {
    if (item.type === 'switch') {
      // Toggle between guest and host mode
      const newMode = currentMode === 'guest' ? 'host' : 'guest';
      router.push(newMode === 'host' ? '/host-dashboard' : '/client-dashboard');
    } else if (item.href) {
      router.push(item.href);
    }
    setIsMenuOpen(false);
  };

  if (!isSignedIn) {
    return null; // Don't show header if not signed in
  }

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              <Home className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-teal-600 hidden sm:block">Houseiana</span>
            </a>

            {/* Center Navigation - Guest Mode */}
            {currentMode === 'guest' && (
              <nav className="hidden md:flex items-center gap-1">
                <a
                  href="/client-dashboard/trips"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full ${
                    pathname?.includes('/trips')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Trips
                </a>
                <a
                  href="/wishlists"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full ${
                    pathname?.includes('/wishlists')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Wishlists
                </a>
                <a
                  href="/messages"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full relative ${
                    pathname?.includes('/messages')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </a>
                <a
                  href="/account"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full ${
                    pathname?.includes('/account')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Account
                </a>
              </nav>
            )}

            {/* Center Navigation - Host Mode */}
            {currentMode === 'host' && (
              <nav className="hidden md:flex items-center gap-1">
                <a
                  href="/host-dashboard"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full ${
                    pathname === '/host-dashboard'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Today
                </a>
                <a
                  href="/host-dashboard/calendar"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full ${
                    pathname?.includes('/calendar')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Calendar
                </a>
                <a
                  href="/host-dashboard/listings"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full ${
                    pathname?.includes('/listings')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Listings
                </a>
                <a
                  href="/messages"
                  className={`px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full relative ${
                    pathname?.includes('/messages')
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </a>
                <div className="relative group">
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1">
                    Menu
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                  {/* Dropdown for more host options */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <a href="/host-dashboard/bookings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <CalendarDays className="w-4 h-4" />
                      Reservations
                    </a>
                    <a href="/host-dashboard/earnings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <DollarSign className="w-4 h-4" />
                      Earnings
                    </a>
                    <a href="/host-dashboard/analytics" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <BarChart2 className="w-4 h-4" />
                      Insights
                    </a>
                    <div className="border-t border-gray-100 my-2" />
                    <a href="/host-dashboard/add-listing" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                      Create new listing
                    </a>
                  </div>
                </div>
              </nav>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Switch to Hosting Button - Desktop (Only show in guest mode if user is a host) */}
              {currentMode === 'guest' && isHost && (
                <a
                  href="/host-dashboard"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Switch to hosting
                </a>
              )}

              {/* Switch to Traveling Button - Desktop (Only show in host mode) */}
              {currentMode === 'host' && (
                <a
                  href="/client-dashboard"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Switch to traveling
                </a>
              )}

              {/* Globe Icon */}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-5 h-5 text-gray-700" />
              </button>

              {/* User Menu Button */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-3 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="relative">
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt={userInfo.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm">
                        {userInfo.initials}
                      </div>
                    )}
                    {/* Notification dot */}
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {userInfo.avatar ? (
                          <img src={userInfo.avatar} alt={userInfo.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium">
                            {userInfo.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{userInfo.name}</p>
                          <p className="text-xs text-gray-500">
                            {currentMode === 'host' ? 'Host mode' : 'Guest mode'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {menuItems.map((item, index) => {
                        if (item.type === 'divider') {
                          return <div key={index} className="border-t border-gray-100 my-1" />;
                        }

                        const Icon = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => handleMenuItemClick(item)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              item.highlight
                                ? 'text-teal-600 font-medium hover:bg-teal-50'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                            {item.type === 'switch' && (
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {currentMode === 'guest' ? (
            <>
              <a href="/discover" className="flex flex-col items-center gap-1 p-2 text-gray-500">
                <Search className="w-6 h-6" />
                <span className="text-xs">Explore</span>
              </a>
              <a href="/wishlists" className="flex flex-col items-center gap-1 p-2 text-gray-500">
                <Heart className="w-6 h-6" />
                <span className="text-xs">Wishlists</span>
              </a>
              <a href="/client-dashboard/trips" className="flex flex-col items-center gap-1 p-2 text-teal-600">
                <CalendarDays className="w-6 h-6" />
                <span className="text-xs font-medium">Trips</span>
              </a>
              <a href="/messages" className="flex flex-col items-center gap-1 p-2 text-gray-500 relative">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </a>
              <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-gray-500">
                <Menu className="w-6 h-6" />
                <span className="text-xs">Menu</span>
              </button>
            </>
          ) : (
            <>
              <a href="/host-dashboard" className="flex flex-col items-center gap-1 p-2 text-teal-600">
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Today</span>
              </a>
              <a href="/host-dashboard/calendar" className="flex flex-col items-center gap-1 p-2 text-gray-500">
                <CalendarDays className="w-6 h-6" />
                <span className="text-xs">Calendar</span>
              </a>
              <a href="/host-dashboard/listings" className="flex flex-col items-center gap-1 p-2 text-gray-500">
                <Building2 className="w-6 h-6" />
                <span className="text-xs">Listings</span>
              </a>
              <a href="/messages" className="flex flex-col items-center gap-1 p-2 text-gray-500 relative">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </a>
              <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-gray-500">
                <Menu className="w-6 h-6" />
                <span className="text-xs">Menu</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
