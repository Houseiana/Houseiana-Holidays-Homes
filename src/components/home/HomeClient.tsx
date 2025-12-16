'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  Search, Globe, Menu, User, Heart, Star, ChevronLeft, ChevronRight,
  Home, Building, Palmtree, Waves, Castle, Tent, Ship,
  MapPin, Calendar, Users as UsersIcon, Minus, Plus, X, Clock
} from 'lucide-react';
import GuestCounter from './GuestCounter';
import CalendarView from './CalendarView';

interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  coverPhoto?: string;
  photos?: string | any[];
  averageRating?: number;
  bookingCount?: number;
  createdAt?: string;
}

interface HomeClientProps {
  initialProperties: Property[];
}

export default function HomeClient({ initialProperties }: HomeClientProps) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchMode, setSearchMode] = useState<string | null>(null); // 'where' | 'checkin' | 'checkout' | 'who'
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Property state - initialized with server data
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false); // No longer loading initially

  // Search state
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchMode(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { id: 'all', name: 'All Homes', icon: Home },
    { id: 'apartments', name: 'Apartments', icon: Building },
    { id: 'villas', name: 'Luxury Villas', icon: Castle },
    { id: 'beach', name: 'Beachfront', icon: Waves },
    { id: 'tropical', name: 'Tropical', icon: Palmtree },
    { id: 'camping', name: 'Camping', icon: Tent },
    { id: 'boats', name: 'Houseboats', icon: Ship },
  ];

  // TODO: Fetch from user's search history
  const recentSearches: Array<{ location: string; type: string }> = [];

  // Qatar destinations
  const suggestedDestinations: Array<{ location: string; distance: string; icon: string }> = [
    { location: 'Ad Dawhah (Doha)', distance: 'Capital city', icon: '🏙️' },
    { location: 'Lusail', distance: 'Modern city', icon: '✨' },
    { location: 'The Pearl-Qatar', distance: 'Luxury island', icon: '💎' },
    { location: 'West Bay', distance: 'Business district', icon: '🏢' },
    { location: 'Al Wakrah', distance: 'Coastal city', icon: '🏖️' },
    { location: 'Al Khor', distance: 'Northern coast', icon: '🐟' },
  ];

  // Filter properties by category
  const filteredProperties = activeCategory === 'all'
    ? properties
    : properties.filter(p => p.title?.toLowerCase().includes(activeCategory.toLowerCase()));

  const getPropertyImage = (property: Property) => {
    if (property.coverPhoto) return property.coverPhoto;
    if (property.photos) {
      try {
        const photos = typeof property.photos === 'string' ? JSON.parse(property.photos) : property.photos;
        if (Array.isArray(photos) && photos.length > 0) return photos[0];
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop';
  };

  const isNewProperty = (property: Property) => {
    if (!property.createdAt) return false;
    const createdDate = new Date(property.createdAt);
    const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated < 30;
  };

  const totalGuests = guests.adults + guests.children;
  const guestText = totalGuests === 0 ? 'Add guests' :
    `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}${guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}` : ''}`;

  // Calendar helper functions
  // (Removed getDaysInMonth as it's now in CalendarView, or needed here? 
  // Wait, CalendarView uses it internally. But HomeClient might not need it anymore unless used elsewhere.
  // Checking usage... getDaysInMonth is only used in CalendarView inline component.
  // So I can remove it too.)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Add dates';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
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

  // Handle search navigation
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location) {
      params.set('location', location);
    }
    if (checkIn) {
      params.set('checkin', checkIn.toISOString().split('T')[0]);
    }
    if (checkOut) {
      params.set('checkout', checkOut.toISOString().split('T')[0]);
    }
    if (guests.adults > 0) {
      params.set('adults', guests.adults.toString());
    }
    if (guests.children > 0) {
      params.set('children', guests.children.toString());
    }
    if (guests.infants > 0) {
      params.set('infants', guests.infants.toString());
    }
    if (guests.pets > 0) {
      params.set('pets', guests.pets.toString());
    }
    const totalGuests = guests.adults + guests.children;
    if (totalGuests > 0) {
      params.set('guests', totalGuests.toString());
    }

    const searchUrl = `/discover${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    setSearchMode(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Unique Houseiana branding */}
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
                  className="bg-teal-500 p-2 rounded-full mr-2 hover:bg-teal-600 transition-colors"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Right Menu */}
            <div className="flex items-center gap-2">
              {/* List your home */}
              <Link href="/host-dashboard/add-listing">
                <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                  List your home
                </button>
              </Link>

              {/* Globe / Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
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

                      <h3 className="font-semibold text-lg mt-6 mb-4">Currency</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { currency: 'USD', symbol: '$', name: 'United States Dollar' },
                          { currency: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
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
                  onClick={() => setShowUserMenu(!showUserMenu)}
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
                          <Link href="/saved-properties">
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
          <div className="absolute left-0 right-0 top-0 bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              {/* Top row with logo and close */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
                </Link>
                <button
                  onClick={() => setSearchMode(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Tabs */}
              <div className="flex justify-center mb-4">
                <div className="flex gap-6">
                  <button className="text-sm font-medium text-gray-900 border-b-2 border-gray-900 pb-3">Stays</button>
                </div>
              </div>

              {/* Search Bar Fields */}
              <div ref={searchRef} className="relative">
                <div className="flex items-center bg-gray-100 rounded-full p-2">
                  {/* Where */}
                  <button
                    onClick={() => setSearchMode('where')}
                    className={`flex-1 text-left px-6 py-3 rounded-full transition-colors ${searchMode === 'where' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                  >
                    <p className="text-xs font-semibold">Where</p>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-sm bg-transparent outline-none text-gray-900 placeholder-gray-500"
                      onFocus={() => setSearchMode('where')}
                    />
                  </button>

                  <span className="h-8 w-px bg-gray-300" />

                  {/* Check in */}
                  <button
                    onClick={() => setSearchMode('checkin')}
                    className={`px-6 py-3 rounded-full transition-colors ${searchMode === 'checkin' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                  >
                    <p className="text-xs font-semibold">Check in</p>
                    <p className={`text-sm ${checkIn ? 'text-gray-900' : 'text-gray-500'}`}>
                      {formatDate(checkIn)}
                    </p>
                  </button>

                  <span className="h-8 w-px bg-gray-300" />

                  {/* Check out */}
                  <button
                    onClick={() => setSearchMode('checkout')}
                    className={`px-6 py-3 rounded-full transition-colors ${searchMode === 'checkout' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                  >
                    <p className="text-xs font-semibold">Check out</p>
                    <p className={`text-sm ${checkOut ? 'text-gray-900' : 'text-gray-500'}`}>
                      {formatDate(checkOut)}
                    </p>
                  </button>

                  <span className="h-8 w-px bg-gray-300" />

                  {/* Who */}
                  <button
                    onClick={() => setSearchMode('who')}
                    className={`flex-1 flex items-center px-6 py-3 rounded-full transition-colors ${searchMode === 'who' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                  >
                    <div>
                      <p className="text-xs font-semibold">Who</p>
                      <p className={`text-sm ${totalGuests > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                        {guestText}
                      </p>
                    </div>
                  </button>

                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all ml-2"
                  >
                    <Search className="w-4 h-4" />
                    <span className="font-medium">Search</span>
                  </button>
                </div>

                {/* Dropdown Panels */}
                {searchMode === 'where' && (
                  <div className="absolute left-0 top-full mt-3 w-[500px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                    {recentSearches.length > 0 && (
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-500 mb-3">Recent searches</h3>
                        {recentSearches.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => { setLocation(item.location); setSearchMode('checkin'); }}
                            className="flex items-center gap-4 w-full p-3 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Clock className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{item.location}</p>
                              <p className="text-sm text-gray-500">Recent search</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xs font-semibold text-gray-500 mb-3">Suggested destinations</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestedDestinations.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => { setLocation(item.location); setSearchMode('checkin'); }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                              {item.icon}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900 text-sm">{item.location}</p>
                              <p className="text-xs text-gray-500">{item.distance}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(searchMode === 'checkin' || searchMode === 'checkout') && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex gap-2 justify-center">
                        {['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days'].map((option, i) => (
                          <button
                            key={i}
                            className={`px-4 py-2 rounded-full text-sm transition-colors ${i === 0 ? 'bg-gray-900 text-white' : 'border border-gray-300 hover:border-gray-900'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex">
                      <CalendarView
                        calendarMonth={calendarMonth}
                        setCalendarMonth={setCalendarMonth}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onDateClick={handleDateClick}
                      />
                      <div className="border-l border-gray-200">
                        <CalendarView
                          calendarMonth={new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)}
                          setCalendarMonth={setCalendarMonth}
                          checkIn={checkIn}
                          checkOut={checkOut}
                          onDateClick={handleDateClick}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {searchMode === 'who' && (
                  <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-6">
                    <GuestCounter
                      label="Adults"
                      description="Ages 13 or above"
                      count={guests.adults}
                      onIncrease={() => setGuests({...guests, adults: guests.adults + 1})}
                      onDecrease={() => setGuests({...guests, adults: Math.max(0, guests.adults - 1)})}
                    />
                    <GuestCounter
                      label="Children"
                      description="Ages 2-12"
                      count={guests.children}
                      onIncrease={() => setGuests({...guests, children: guests.children + 1})}
                      onDecrease={() => setGuests({...guests, children: Math.max(0, guests.children - 1)})}
                    />
                    <GuestCounter
                      label="Infants"
                      description="Under 2"
                      count={guests.infants}
                      onIncrease={() => setGuests({...guests, infants: guests.infants + 1})}
                      onDecrease={() => setGuests({...guests, infants: Math.max(0, guests.infants - 1)})}
                    />
                    <GuestCounter
                      label="Pets"
                      description="Bringing a service animal?"
                      count={guests.pets}
                      onIncrease={() => setGuests({...guests, pets: guests.pets + 1})}
                      onDecrease={() => setGuests({...guests, pets: Math.max(0, guests.pets - 1)})}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search */}
        <div className="md:hidden px-6 pb-4">
          <button
            onClick={() => setSearchMode('where')}
            className="w-full flex items-center gap-4 border border-gray-300 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <Search className="w-5 h-5 text-gray-900" />
            <div className="text-left">
              <p className="text-sm font-medium">{location || 'Anywhere'}</p>
              <p className="text-xs text-gray-500">
                {checkIn ? `${formatDate(checkIn)} - ${formatDate(checkOut)}` : 'Any week'} · {guestText}
              </p>
            </div>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide">
              <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 border border-gray-200">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex flex-col items-center gap-2 px-4 py-2 min-w-fit transition-all ${
                      activeCategory === category.id
                        ? 'opacity-100'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${activeCategory === category.id ? 'text-teal-600' : ''}`} />
                    <span className={`text-xs whitespace-nowrap ${activeCategory === category.id ? 'font-semibold text-teal-600 border-b-2 border-teal-600 pb-1' : 'font-medium'}`}
                    >
                      {category.name}
                    </span>
                  </button>
                );
              })}

              <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 border border-gray-200">
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Filter Button */}
              <button
                onClick={() => router.push('/discover')}
                className="ml-4 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                  <path fillRule="evenodd" d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
                </svg>
                <span className="text-xs font-medium">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Property Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No properties found</p>
            <Link href="/discover">
              <button className="mt-4 px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600">
                Explore All Properties
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                    <img
                      src={getPropertyImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle wishlist toggle
                      }}
                      className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
                    >
                      <Heart className="w-6 h-6 text-white drop-shadow-lg hover:fill-white/50" />
                    </button>
                    {isNewProperty(property) && (
                      <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                        <span>🏆</span> Guest favorite
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{property.city}, {property.country}</h3>
                      {property.averageRating && property.averageRating > 0 && (
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{property.averageRating.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{property.title}</p>
                    <p className="text-gray-500 text-sm">Available now</p>
                    <p className="text-gray-900 pt-1">
                      <span className="font-semibold">${property.pricePerNight}</span>
                      <span className="text-gray-500"> night</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Safety information</a></li>
                <li><a href="#" className="hover:underline">Cancellation options</a></li>
                <li><a href="#" className="hover:underline">Report a concern</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hosting</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/host-dashboard/add-listing" className="hover:underline">List your home</Link></li>
                <li><a href="#" className="hover:underline">Host resources</a></li>
                <li><a href="#" className="hover:underline">Community forum</a></li>
                <li><a href="#" className="hover:underline">Hosting responsibly</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
