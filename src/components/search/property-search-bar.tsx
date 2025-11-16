'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import LocationDropdown from './location-dropdown';
import DatePicker from './date-picker';
import GuestSelector from './guest-selector';

interface SearchData {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
}

interface PropertySearchBarProps {
  variant?: 'compact' | 'expanded';
  onSearch?: (data: SearchData) => void;
  className?: string;
}

export default function PropertySearchBar({
  variant = 'expanded',
  onSearch,
  className = ''
}: PropertySearchBarProps) {
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData>({
    location: '',
    checkIn: null,
    checkOut: null,
    guests: {
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0
    }
  });

  const [activeDropdown, setActiveDropdown] = useState<'location' | 'checkIn' | 'checkOut' | 'guests' | null>(null);

  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    try {
      const searchParams = new URLSearchParams();

      // Location with validation
      if (searchData.location && searchData.location.trim()) {
        searchParams.set('location', searchData.location.trim());
      }

      // Dates with validation
      if (searchData.checkIn && searchData.checkIn instanceof Date) {
        searchParams.set('checkin', searchData.checkIn.toISOString());
      }

      if (searchData.checkOut && searchData.checkOut instanceof Date) {
        searchParams.set('checkout', searchData.checkOut.toISOString());
      }

      // Guests with validation
      const guests = searchData.guests || { adults: 0, children: 0, infants: 0, pets: 0 };
      const totalGuests = (guests.adults || 0) + (guests.children || 0);

      if (totalGuests > 0) {
        searchParams.set('guests', totalGuests.toString());
      }

      if (guests.adults > 0) {
        searchParams.set('adults', guests.adults.toString());
      }

      if (guests.children > 0) {
        searchParams.set('children', guests.children.toString());
      }

      if (guests.infants > 0) {
        searchParams.set('infants', guests.infants.toString());
      }

      if (guests.pets > 0) {
        searchParams.set('pets', guests.pets.toString());
      }

      // Execute search
      if (onSearch) {
        onSearch(searchData);
      } else {
        const searchUrl = `/discover?${searchParams.toString()}`;
        console.log('PropertySearchBar: Searching with URL:', searchUrl);
        router.push(searchUrl);
      }
    } catch (error) {
      console.error('PropertySearchBar: Search error:', error);
      // Fallback to basic discover page
      router.push('/discover');
    }
  };

  const updateSearchData = (field: keyof SearchData, value: any) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDateRange = () => {
    if (!searchData.checkIn && !searchData.checkOut) return 'Add dates';
    if (searchData.checkIn && !searchData.checkOut) {
      return `${searchData.checkIn.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - Add checkout`;
    }
    if (searchData.checkIn && searchData.checkOut) {
      return `${searchData.checkIn.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${searchData.checkOut.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}`;
    }
    return 'Add dates';
  };

  const formatGuests = () => {
    const total = searchData.guests.adults + searchData.guests.children;
    if (total === 0) return 'Add guests';
    if (total === 1) return '1 guest';
    return `${total} guests`;
  };

  if (variant === 'compact') {
    return (
      <div ref={searchBarRef} className={`relative ${className}`}>
        <button
          onClick={() => setActiveDropdown(activeDropdown ? null : 'location')}
          className="flex items-center w-full px-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">
              {searchData.location || 'Where to?'}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateRange()} • {formatGuests()}
            </div>
          </div>
        </button>

        {activeDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 z-50">
            <div className="space-y-6">
              <LocationDropdown
                value={searchData.location}
                onChange={(value) => updateSearchData('location', value)}
                onClose={() => setActiveDropdown(null)}
              />

              <DatePicker
                checkIn={searchData.checkIn}
                checkOut={searchData.checkOut}
                onCheckInChange={(date) => updateSearchData('checkIn', date)}
                onCheckOutChange={(date) => updateSearchData('checkOut', date)}
              />

              <GuestSelector
                guests={searchData.guests}
                onChange={(guests) => updateSearchData('guests', guests)}
              />

              <button
                onClick={handleSearch}
                className="w-full py-3 bg-[#FF385C] text-white rounded-lg font-semibold hover:bg-[#E31C5F] transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={searchBarRef} className={`relative ${className}`}>
      <div className="flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow bg-white overflow-visible">
        {/* Location */}
        <div className="relative flex-1">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
            className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 rounded-l-full transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#FF385C] mr-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 mb-1">Where</div>
              <div className="text-sm text-gray-900 truncate">
                {searchData.location || 'Search destinations'}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${
              activeDropdown === 'location' ? 'rotate-180' : ''
            }`} />
          </button>

          {activeDropdown === 'location' && (
            <LocationDropdown
              value={searchData.location}
              onChange={(value) => {
                updateSearchData('location', value);
                setActiveDropdown(null);
              }}
              onClose={() => setActiveDropdown(null)}
            />
          )}
        </div>

        {/* Check-in */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'checkIn' ? null : 'checkIn')}
            className="flex items-center px-4 py-3 text-left hover:bg-gray-50 border-l border-gray-200 transition-colors min-w-[140px]"
          >
            <Calendar className="w-4 h-4 text-[#FF385C] mr-2 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Check in</div>
              <div className="text-sm text-gray-900">
                {searchData.checkIn ?
                  searchData.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                  'Add dates'
                }
              </div>
            </div>
          </button>
        </div>

        {/* Check-out */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'checkOut' ? null : 'checkOut')}
            className="flex items-center px-4 py-3 text-left hover:bg-gray-50 border-l border-gray-200 transition-colors min-w-[140px]"
          >
            <Calendar className="w-4 h-4 text-[#FF385C] mr-2 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Check out</div>
              <div className="text-sm text-gray-900">
                {searchData.checkOut ?
                  searchData.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                  'Add dates'
                }
              </div>
            </div>
          </button>
        </div>

        {/* Guests */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
            className="flex items-center px-4 py-3 text-left hover:bg-gray-50 border-l border-gray-200 transition-colors min-w-[140px]"
          >
            <Users className="w-4 h-4 text-[#FF385C] mr-2 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Who</div>
              <div className="text-sm text-gray-900">{formatGuests()}</div>
            </div>
          </button>

          {activeDropdown === 'guests' && (
            <GuestSelector
              guests={searchData.guests}
              onChange={(guests) => updateSearchData('guests', guests)}
              onClose={() => setActiveDropdown(null)}
            />
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-[#FF385C] hover:bg-[#E31C5F] text-white p-3 rounded-r-full transition-colors flex-shrink-0"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Date Picker Modal */}
      {(activeDropdown === 'checkIn' || activeDropdown === 'checkOut') && (
        <DatePicker
          checkIn={searchData.checkIn}
          checkOut={searchData.checkOut}
          onCheckInChange={(date) => updateSearchData('checkIn', date)}
          onCheckOutChange={(date) => updateSearchData('checkOut', date)}
          onClose={() => setActiveDropdown(null)}
          focusedInput={activeDropdown}
        />
      )}
    </div>
  );
}