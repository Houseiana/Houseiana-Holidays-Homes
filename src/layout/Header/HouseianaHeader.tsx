'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Home, Search, Heart, MessageSquare, User, Globe, Menu, X,
  Building2, CalendarDays, DollarSign, BarChart2, Settings,
  HelpCircle, LogOut, ChevronRight, Star, Bell, Plus,
  LayoutDashboard, BookOpen, FileText, Users, Sparkles,
  ArrowLeftRight, UserCircle, CreditCard, Shield, Gift
} from 'lucide-react';
import Image from 'next/image';

import { getMessaging, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import toast from 'react-hot-toast';

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
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const { user, isSignedIn, isLoaded } = useUser();

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  //     const messaging = getMessaging(app);
  //     const unsubscribe = onMessage(messaging, (payload) => {
  //       console.log('Foreground message received:', payload);
  //       toast(payload.notification?.title || 'New Notification', {
  //           icon: '🔔', 
  //           duration: 10000
  //       });
  //     });
  //     return () => {
  //       unsubscribe(); 
  //     };
  //   }
  // }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  // Determine current mode based on URL
  const currentMode = pathname?.startsWith('/host-dashboard') ? 'host' : 'guest';

  // Check if user is a host (has properties)
  // In production, this would come from your database
  const isHost = true; // TODO: Get from user metadata or database

  const userInfo = {
    name: user?.fullName || user?.firstName || 'User',
    initials: user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U',
    avatar: user?.imageUrl,
    isVerified: true,
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore if the target element is no longer in the document (e.g., removed by React re-render)
      if (event.target instanceof Node && !document.contains(event.target)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setShowCurrencyMenu(false);
      }
    };
    
    // Use mousedown to detect clicks before they are processed by other handlers
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

  const anonMenuItems: MenuItem[] = [
    { type: 'link' as const, label: 'Sign up', href: '/sign-up', icon: User, highlight: true },
    { type: 'link' as const, label: 'Log in', href: '/sign-in', icon: LogOut }, // LogOut icon used as placeholder or use User
    { type: 'divider' as const },
    { type: 'link' as const, label: 'List your home', href: '/host-dashboard/add-listing', icon: Building2 },
    { type: 'link' as const, label: 'Help Center', href: '/help', icon: HelpCircle },
  ];

  // Ensure consistent rendering during hydration/loading
  const menuItems = (!isLoaded || !isSignedIn) ? anonMenuItems : (currentMode === 'host' ? hostMenuItems : guestMenuItems);

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

  // Don't show this header on the home page as it has its own specialized header
  // Also hide on auth pages for a cleaner experience
  if (pathname === '/' || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname?.startsWith('/properties')) {
    return null;
  }

  // Helper to check active state
  const isTripsActive = (pathname === '/client-dashboard' && (!currentTab || currentTab === 'trips')) || pathname?.startsWith('/client-dashboard/');
  const isWishlistsActive = pathname?.startsWith('/wishlists') || (pathname === '/client-dashboard' && currentTab === 'wishlists');
  const isMessagesActive = pathname?.startsWith('/messages') || (pathname === '/client-dashboard' && currentTab === 'messages');
  const isAccountActive = pathname?.startsWith('/account') || (pathname === '/client-dashboard' && currentTab === 'account');

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-teal-600 hidden sm:block">Houseiana</span>
            </a>

            {/* Center Navigation - Guest Mode */}
            {currentMode === 'guest' && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/client-dashboard"
                  className={`text-sm font-medium transition-colors min-h-0 ${
                    isTripsActive
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    isTripsActive
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Trips
                  </span>
                </Link>
                <Link
                  href="/wishlists"
                  className={`text-sm font-medium transition-colors min-h-0 ${
                    isWishlistsActive
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    isWishlistsActive
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Wishlists
                  </span>
                </Link>
                <Link
                  href="/messages"
                  className={`text-sm font-medium transition-colors relative min-h-0 ${
                    isMessagesActive
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    isMessagesActive
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Messages
                  </span>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className={`text-sm font-medium transition-colors min-h-0 ${
                    isAccountActive
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    isAccountActive
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Account
                  </span>
                </Link>
              </nav>
            )}

            {/* Center Navigation - Host Mode */}
            {currentMode === 'host' && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/host-dashboard"
                  className={`text-sm font-medium transition-colors min-h-0 ${
                    pathname === '/host-dashboard'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    pathname === '/host-dashboard'
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Today
                  </span>
                </Link>
                <Link
                  href="/host-dashboard/calendar"
                  className={`text-sm font-medium transition-colors min-h-0 ${
                    pathname?.startsWith('/host-dashboard/calendar')
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    pathname?.startsWith('/host-dashboard/calendar')
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Calendar
                  </span>
                </Link>
                <Link
                  href="/host-dashboard/listings"
                  className={`text-sm font-medium transition-colors min-h-0 ${
                    pathname?.startsWith('/host-dashboard/listings')
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    pathname?.startsWith('/host-dashboard/listings')
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Listings
                  </span>
                </Link>
                <Link
                  href="/messages"
                  className={`text-sm font-medium transition-colors relative min-h-0 ${
                    pathname?.startsWith('/messages')
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className={`pb-2 border-b-2 ${
                    pathname?.startsWith('/messages')
                      ? 'border-gray-900'
                      : 'border-transparent hover:border-gray-300'
                  }`}>
                    Messages
                  </span>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
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

              {/* Notification Bell */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-700" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Currency Selector */}
              <div className="relative" ref={currencyMenuRef}>
                <button
                  onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors font-medium text-gray-700 text-sm"
                >
                  QAR
                </button>

                {showCurrencyMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Currency</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { currency: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
                          { currency: 'USD', symbol: '$', name: 'United States Dollar' },
                          { currency: 'EUR', symbol: '€', name: 'Euro' },
                          { currency: 'GBP', symbol: '£', name: 'British Pound' },
                        ].map((item, i) => (
                          <button
                            key={i}
                            className={`text-left p-3 rounded-lg border transition-colors ${i === 0 ? 'border-gray-900 bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                          >
                            <span className="font-medium text-sm">{item.symbol} – {item.currency}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Globe className="w-5 h-5 text-gray-700" />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Language and region</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { lang: 'English', region: 'United States', flag: '🇺🇸' },
                          { lang: 'العربية', region: 'قطر', flag: '🇶🇦' },
                          { lang: 'English', region: 'United Kingdom', flag: '🇬🇧' },
                          { lang: 'Français', region: 'France', flag: '🇫🇷' },
                        ].map((item, i) => (
                          <button
                            key={i}
                            className={`text-left p-3 rounded-lg border transition-colors ${i === 0 ? 'border-gray-900 bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                          >
                            <span className="mr-2">{item.flag}</span>
                            <span className="text-sm font-medium">{item.lang}</span>
                            <p className="text-xs text-gray-500 mt-0.5 ml-6">{item.region}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu Button */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    setShowLanguageMenu(false);
                    setShowCurrencyMenu(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-3 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="relative">
                    {!isLoaded ? (
                       <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : isSignedIn && userInfo.avatar ? (
                      <Image src={userInfo.avatar} alt={userInfo.name} width={32} height={32} className="rounded-full" />
                    ) : isSignedIn ? (
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm">
                        {userInfo.initials}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
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
                    {/* User Info Header - Only show if signed in */}
                    {isSignedIn && (
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {userInfo.avatar ? (
                            <Image src={userInfo.avatar} alt={userInfo.name} width={40} height={40} className="rounded-full" />
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
                    )}

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
              <Link 
                href="/discover" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  pathname === '/discover' || pathname?.startsWith('/properties') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Search className="w-6 h-6" />
                <span className="text-xs">Explore</span>
              </Link>
              <Link 
                href="/wishlists" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  pathname?.startsWith('/wishlists') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Heart className="w-6 h-6" />
                <span className="text-xs">Wishlists</span>
              </Link>
              <Link 
                href="/client-dashboard" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  pathname === '/client-dashboard' || pathname?.startsWith('/client-dashboard/') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <CalendarDays className="w-6 h-6" />
                <span className="text-xs font-medium">Trips</span>
              </Link>
              <Link 
                href="/messages" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${
                  pathname?.startsWith('/messages') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
                <span className="text-xs">Menu</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/host-dashboard" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  pathname === '/host-dashboard' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Today</span>
              </Link>
              <Link 
                href="/host-dashboard/calendar" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  pathname?.startsWith('/host-dashboard/calendar') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <CalendarDays className="w-6 h-6" />
                <span className="text-xs">Calendar</span>
              </Link>
              <Link 
                href="/host-dashboard/listings" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  pathname?.startsWith('/host-dashboard/listings') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-xs">Listings</span>
              </Link>
              <Link 
                href="/messages" 
                className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${
                  pathname?.startsWith('/messages') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-gray-900"
              >
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
