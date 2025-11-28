'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  Minus,
  Plus
} from 'lucide-react';
import AirbnbFilter, { FilterState } from './airbnb-filter';

interface SearchFilters extends FilterState {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}


export function EnhancedSearch({ onSearch, initialFilters = {} }: EnhancedSearchProps) {
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const guestSelectorRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    infants: 0,
    propertyType: '',
    priceMin: 0,
    priceMax: 1000,
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    maxGuests: 0,
    minRating: 0,
    amenities: [],
    ...initialFilters
  });

  const [filterState, setFilterState] = useState<FilterState>({
    propertyType: initialFilters.propertyType || '',
    priceMin: initialFilters.priceMin || 0,
    priceMax: initialFilters.priceMax || 1000,
    bedrooms: initialFilters.bedrooms || 0,
    beds: initialFilters.beds || 0,
    bathrooms: initialFilters.bathrooms || 0,
    maxGuests: initialFilters.maxGuests || 0,
    minRating: initialFilters.minRating || 0,
    amenities: initialFilters.amenities || []
  });

  // TODO: Fetch from API - location search autocomplete
  const locationSuggestions: Array<{
    id: string;
    name: string;
    country: string;
    type: string;
  }> = [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestSelectorRef.current && !guestSelectorRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const adjustGuests = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setFilters(prev => {
      const newValue = Math.max(0, prev[type] + (increment ? 1 : -1));
      const newFilters = { ...prev, [type]: newValue };

      // Auto-update maxGuests based on adults + children
      if (type === 'adults' || type === 'children') {
        const totalGuests = (type === 'adults' ? newValue : prev.adults) +
                           (type === 'children' ? newValue : prev.children);
        newFilters.maxGuests = totalGuests;
      }

      return newFilters;
    });
  };


  const handleLocationSelect = (location: any) => {
    const locationString = `${location.name}, ${location.country}`;
    updateFilter('location', locationString);
    setShowLocationDropdown(false);
  };

  const getFilteredLocationSuggestions = () => {
    if (!filters.location) return locationSuggestions;
    return locationSuggestions.filter(location =>
      location.name.toLowerCase().includes(filters.location.toLowerCase()) ||
      location.country.toLowerCase().includes(filters.location.toLowerCase())
    );
  };

  const getTotalGuests = () => filters.adults + filters.children;

  const getGuestText = () => {
    const total = getTotalGuests();
    if (total === 0) return 'Add guests';
    if (total === 1) return '1 guest';

    let text = `${total} guests`;
    if (filters.infants > 0) {
      text += `, ${filters.infants} infant${filters.infants > 1 ? 's' : ''}`;
    }
    return text;
  };

  const handleSearch = () => {
    console.log('Search button clicked!', filters);
    onSearch(filters);
    setShowFilterModal(false);
  };


  const hasActiveFilters = (): boolean => {
    return filters.propertyType !== '' ||
           filters.priceMin > 0 ||
           filters.priceMax < 1000 ||
           filters.bedrooms > 0 ||
           filters.beds > 0 ||
           filters.bathrooms > 0 ||
           filters.maxGuests > 0 ||
           filters.minRating > 0 ||
           filters.amenities.length > 0;
  };

  return (
    <>
      {/* Main Search Bar */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-white/20">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Location */}
            <div className="flex-1 flex items-center px-6 py-5 border-b lg:border-b-0 lg:border-r border-gray-200 relative z-10" ref={locationRef}>
              <MapPin className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
              <div className="flex-1 relative z-20">
                <label
                  htmlFor="location-input"
                  className="block text-sm font-semibold text-gray-900 mb-1 cursor-pointer"
                >
                  Where
                </label>
                <input
                  id="location-input"
                  type="text"
                  value={filters.location}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateFilter('location', e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={(e) => {
                    e.stopPropagation();
                    if (locationRef.current) {
                      const rect = locationRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                        width: rect.width
                      });
                    }
                    setShowLocationDropdown(true);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  placeholder="Search destinations"
                  className="w-full outline-none text-gray-900 text-sm bg-transparent relative z-30"
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 30
                  }}
                  autoComplete="off"
                />
              </div>

            </div>

            {/* Check In */}
            <div className="flex-1 flex items-center px-6 py-5 border-b lg:border-b-0 lg:border-r border-gray-200">
              <Calendar className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">Check in</label>
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => updateFilter('checkIn', e.target.value)}
                  className="w-full outline-none text-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Check Out */}
            <div className="flex-1 flex items-center px-6 py-5 border-b lg:border-b-0 lg:border-r border-gray-200">
              <Calendar className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">Check out</label>
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => updateFilter('checkOut', e.target.value)}
                  className="w-full outline-none text-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 relative" ref={guestSelectorRef}>
              <button
                onClick={() => setShowGuestSelector(!showGuestSelector)}
                className="w-full flex items-center px-6 py-5 border-b lg:border-b-0 lg:border-r border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Who</label>
                  <span className="text-sm text-gray-600">{getGuestText()}</span>
                </div>
              </button>

              {/* Guest Selector Dropdown */}
              {showGuestSelector && (
                <div className="absolute top-full left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-6">
                  <div className="space-y-6">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Adults</div>
                        <div className="text-sm text-gray-500">Ages 13 or above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => adjustGuests('adults', false)}
                          disabled={filters.adults <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{filters.adults}</span>
                        <button
                          onClick={() => adjustGuests('adults', true)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Children</div>
                        <div className="text-sm text-gray-500">Ages 2-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => adjustGuests('children', false)}
                          disabled={filters.children <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{filters.children}</span>
                        <button
                          onClick={() => adjustGuests('children', true)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Infants</div>
                        <div className="text-sm text-gray-500">Under 2</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => adjustGuests('infants', false)}
                          disabled={filters.infants <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{filters.infants}</span>
                        <button
                          onClick={() => adjustGuests('infants', true)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filters & Search */}
            <div className="flex">
              <button
                type="button"
                onClick={() => {
                  console.log('Filter button clicked!');
                  setShowFilterModal(true);
                }}
                className={`px-6 py-5 border-r border-gray-200 hover:bg-gray-50 transition-colors relative cursor-pointer ${
                  hasActiveFilters() ? 'bg-orange-50' : ''
                }`}
                aria-label="Open filters"
              >
                <Filter className="w-6 h-6 text-gray-600" />
                {hasActiveFilters() && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-5 lg:rounded-r-xl hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 font-semibold flex items-center justify-center gap-2 cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Airbnb-style Filter Component */}
      <AirbnbFilter
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filterState}
        onFiltersChange={(newFilters) => {
          setFilterState(newFilters);
          setFilters(prev => ({ ...prev, ...newFilters }));
        }}
        onApply={(appliedFilters) => {
          setFilters(prev => ({ ...prev, ...appliedFilters }));
          handleSearch();
        }}
      />

      {/* Location Dropdown Portal */}
      {showLocationDropdown && typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed bg-white shadow-xl rounded-xl border border-gray-200 z-[9999] max-h-80 overflow-y-auto min-w-[300px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: Math.max(dropdownPosition.width, 300)
            }}
          >
            {getFilteredLocationSuggestions().map((location) => (
              <div
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{location.name}, {location.country}</div>
                  <div className="text-sm text-gray-500 capitalize">{location.type}</div>
                </div>
              </div>
            ))}
          </div>,
          document.body
        )
      }
    </>
  );
}