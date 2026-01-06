'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  Search,
  Menu,
  User,
  Globe,
  Home,
  X,
  Bell,
  Filter
} from 'lucide-react';
import CategoryTabs from './CategoryTabs';
import ExpandedSearch, { GuestCounts } from './ExpandedSearch';
import { getMessaging, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface HomeHeaderProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  notifications?: number;
  showCategories?: boolean;
  onShowFilters?: () => void;
}

export default function HomeHeader({ 
  activeCategory, 
  setActiveCategory, 
  notifications = 0,
  showCategories = true,
  onShowFilters
}: HomeHeaderProps) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [searchMode, setSearchMode] = useState<string | null>(null);

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
  
  // Menus state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  // Search state
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 0, children: 0, infants: 0, pets: 0 });
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  const totalGuests = guests.adults + guests.children;
  const guestText = totalGuests === 0 ? 'Add guests' :
    `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}${guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}` : ''}`;

  const formatDate = (date: Date | null) => {
    if (!date) return 'Add dates';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDateClick = (selectedDate: Date) => {
    if (searchMode === 'checkin') {
      setCheckIn(selectedDate);
      setSearchMode('checkout');
    } else if (searchMode === 'checkout') {
      if (checkIn && selectedDate > checkIn) {
        setCheckOut(selectedDate);
        setSearchMode('who');
      } else {
        setCheckIn(selectedDate);
      }
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkin', checkIn.toISOString().split('T')[0]);
    if (checkOut) params.set('checkout', checkOut.toISOString().split('T')[0]);
    if (guests.adults > 0) params.set('adults', guests.adults.toString());
    if (guests.children > 0) params.set('children', guests.children.toString());
    if (guests.infants > 0) params.set('infants', guests.infants.toString());
    if (guests.pets > 0) params.set('pets', guests.pets.toString());
    const total = guests.adults + guests.children;
    if (total > 0) params.set('guests', total.toString());

    const searchUrl = `/properties${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    setSearchMode(null);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close other menus
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target as Node)) {
        setShowCurrencyMenu(false);
      }

      // Close ExpandedSearch (and CalendarView) if clicking outside
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchMode(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </div>
          </Link>

          {/* Collapsed Search Bar (when not expanded) */}
          {!searchMode && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <button
                  onClick={() => setSearchMode('where')}
                  className="px-4 py-3 text-sm font-medium"
                >
                  {location || 'Anywhere'}
                </button>
                <span className="h-6 w-px bg-gray-300" />
                <button
                  onClick={() => setSearchMode('checkin')}
                  className="px-4 py-3 text-sm font-medium"
                >
                  {checkIn ? formatDate(checkIn) : 'Any week'}
                </button>
                <span className="h-6 w-px bg-gray-300" />
                <button
                  onClick={() => setSearchMode('who')}
                  className="px-4 py-3 text-sm text-gray-500 flex items-center gap-3 pr-2"
                >
                  {totalGuests > 0 ? guestText : 'Add guests'}
                </button>
                <button
                  onClick={handleSearch}
                  className="bg-teal-500 rounded-full hover:bg-teal-600 transition-colors flex items-center justify-center"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
              {/* Optional Filter Button (Desktop) - Only shows when searchMode is off (collapsed) */}
              {!searchMode && onShowFilters && (
                <button
                  onClick={onShowFilters}
                  className="hidden md:flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors ml-4"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              )}
            </div>  
          )}



          {/* Right Menu */}
          <div className="flex items-center gap-2">
            <Link href="/host-dashboard/add-listing" className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
              List your home
            </Link>

            {/* Notification Bell */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-gray-700" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => {
                  setShowLanguageMenu(!showLanguageMenu);
                  setShowCurrencyMenu(false);
                  setShowUserMenu(false);
                }}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Globe className="w-5 h-5" />
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

            {/* Currency Selector */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                onClick={() => {
                  setShowCurrencyMenu(!showCurrencyMenu);
                  setShowLanguageMenu(false);
                  setShowUserMenu(false);
                }}
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

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowLanguageMenu(false);
                  setShowCurrencyMenu(false);
                }}
                className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                {isSignedIn && user ? (
                  <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                ) : (
                  <div className="bg-gray-500 rounded-full p-1.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 py-2">
                  {isSignedIn ? (
                    <>
                      <div className="border-b border-gray-200 pb-2">
                        <Link href="/client-dashboard">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 font-semibold">Dashboard</button>
                        </Link>
                        <Link href="/client-dashboard?tab=wishlists">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 font-semibold">Wishlists</button>
                        </Link>
                      </div>
                      <div className="border-b border-gray-200 py-2">
                        <Link href="/host-dashboard/add-listing">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50">List your home</button>
                        </Link>
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50">Help Center</button>
                      </div>
                      <div className="pt-2">
                        <SignOutButton>
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600">
                            Log out
                          </button>
                        </SignOutButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-b border-gray-200 pb-2">
                        <Link href="/sign-up">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 font-semibold">Sign up</button>
                        </Link>
                        <Link href="/sign-in">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50">Log in</button>
                        </Link>
                      </div>
                      <div className="pt-2">
                        <Link href="/host-dashboard/add-listing">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50">List your home</button>
                        </Link>
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50">Help Center</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Search Bar */}
      {searchMode && (
        <ExpandedSearch
          location={location}
          setLocation={setLocation}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          guests={guests}
          setGuests={setGuests}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
          totalGuests={totalGuests}
          guestText={guestText}
          handleDateClick={handleDateClick}
          handleSearch={handleSearch}
          formatDate={formatDate}
          searchRef={searchRef}
        />
      )}

      {/* Category Tabs */}
      {showCategories && (
        <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
      )}
    </header>
  );
}
