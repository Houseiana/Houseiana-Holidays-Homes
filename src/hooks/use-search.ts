'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Recent search interface
export interface RecentSearch {
  id: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  timestamp: number;
}

// Filter state interface (from airbnb-filter)
export interface FilterState {
  propertyType: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  minRating: number;
  amenities: string[];
}

// Complete search filters interface
export interface SearchFilters extends FilterState {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

// Default filter values
const DEFAULT_FILTERS: SearchFilters = {
  location: '',
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  propertyType: '',
  priceMin: 0,
  priceMax: 1000,
  bedrooms: 0,
  beds: 0,
  bathrooms: 0,
  maxGuests: 0,
  minRating: 0,
  amenities: [],
};

const RECENT_SEARCHES_KEY = 'houseiana_recent_searches';
const MAX_RECENT_SEARCHES = 5;

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSearch(initialFilters?: Partial<SearchFilters>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params or defaults
  const getInitialFilters = useCallback((): SearchFilters => {
    const fromUrl: Partial<SearchFilters> = {};

    if (searchParams) {
      const location = searchParams.get('location');
      const checkIn = searchParams.get('checkin');
      const checkOut = searchParams.get('checkout');
      const adults = searchParams.get('adults');
      const children = searchParams.get('children');
      const infants = searchParams.get('infants');
      const pets = searchParams.get('pets');
      const propertyType = searchParams.get('propertyType');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const bedrooms = searchParams.get('bedrooms');
      const beds = searchParams.get('beds');
      const bathrooms = searchParams.get('bathrooms');

      if (location) fromUrl.location = location;
      if (checkIn) fromUrl.checkIn = checkIn;
      if (checkOut) fromUrl.checkOut = checkOut;
      if (adults) fromUrl.adults = parseInt(adults);
      if (children) fromUrl.children = parseInt(children);
      if (infants) fromUrl.infants = parseInt(infants);
      if (pets) fromUrl.pets = parseInt(pets);
      if (propertyType) fromUrl.propertyType = propertyType;
      if (minPrice) fromUrl.priceMin = parseFloat(minPrice);
      if (maxPrice) fromUrl.priceMax = parseFloat(maxPrice);
      if (bedrooms) fromUrl.bedrooms = parseInt(bedrooms);
      if (beds) fromUrl.beds = parseInt(beds);
      if (bathrooms) fromUrl.bathrooms = parseInt(bathrooms);
    }

    return { ...DEFAULT_FILTERS, ...initialFilters, ...fromUrl };
  }, [searchParams, initialFilters]);

  const [filters, setFilters] = useState<SearchFilters>(getInitialFilters);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced location for filtering
  const debouncedLocation = useDebounce(filters.location, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Update filter
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Batch update filters
  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Adjust guest counts
  const adjustGuests = useCallback((
    type: 'adults' | 'children' | 'infants' | 'pets',
    increment: boolean
  ) => {
    setFilters(prev => {
      const minValue = type === 'adults' ? 1 : 0;
      const newValue = Math.max(minValue, prev[type] + (increment ? 1 : -1));
      const newFilters = { ...prev, [type]: newValue };

      // Auto-update maxGuests based on adults + children
      if (type === 'adults' || type === 'children') {
        const totalGuests = (type === 'adults' ? newValue : prev.adults) +
                           (type === 'children' ? newValue : prev.children);
        newFilters.maxGuests = totalGuests;
      }

      return newFilters;
    });
  }, []);

  // Get total guests (adults + children, infants don't count)
  const totalGuests = useMemo(() =>
    filters.adults + filters.children
  , [filters.adults, filters.children]);

  // Get formatted guest text
  const guestText = useMemo(() => {
    if (totalGuests === 0) return 'Add guests';
    if (totalGuests === 1) return '1 guest';

    let text = `${totalGuests} guests`;
    if (filters.infants > 0) {
      text += `, ${filters.infants} infant${filters.infants > 1 ? 's' : ''}`;
    }
    if (filters.pets > 0) {
      text += `, ${filters.pets} pet${filters.pets > 1 ? 's' : ''}`;
    }
    return text;
  }, [totalGuests, filters.infants, filters.pets]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.propertyType !== '' ||
           filters.priceMin > 0 ||
           filters.priceMax < 1000 ||
           filters.bedrooms > 0 ||
           filters.beds > 0 ||
           filters.bathrooms > 0 ||
           filters.maxGuests > 0 ||
           filters.minRating > 0 ||
           filters.amenities.length > 0;
  }, [filters]);

  // Save recent search
  const saveRecentSearch = useCallback(() => {
    if (!filters.location && !filters.checkIn) return;

    const newSearch: RecentSearch = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      location: filters.location,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: totalGuests,
      timestamp: Date.now(),
    };

    setRecentSearches(prev => {
      // Remove duplicates and add new search at the beginning
      const filtered = prev.filter(s =>
        s.location !== newSearch.location ||
        s.checkIn !== newSearch.checkIn
      );
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches:', error);
      }

      return updated;
    });
  }, [filters.location, filters.checkIn, filters.checkOut, totalGuests]);

  // Build search URL
  const buildSearchUrl = useCallback((baseUrl = '/discover') => {
    const params = new URLSearchParams();

    if (filters.location) params.set('location', filters.location);
    if (filters.checkIn) params.set('checkin', filters.checkIn);
    if (filters.checkOut) params.set('checkout', filters.checkOut);
    if (totalGuests > 0) params.set('guests', totalGuests.toString());
    if (filters.adults > 0) params.set('adults', filters.adults.toString());
    if (filters.children > 0) params.set('children', filters.children.toString());
    if (filters.infants > 0) params.set('infants', filters.infants.toString());
    if (filters.pets > 0) params.set('pets', filters.pets.toString());
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.priceMin > 0) params.set('minPrice', filters.priceMin.toString());
    if (filters.priceMax < 1000) params.set('maxPrice', filters.priceMax.toString());
    if (filters.bedrooms > 0) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.beds > 0) params.set('beds', filters.beds.toString());
    if (filters.bathrooms > 0) params.set('bathrooms', filters.bathrooms.toString());
    if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [filters, totalGuests]);

  // Execute search
  const executeSearch = useCallback(async () => {
    setIsSearching(true);

    // Save to recent searches
    saveRecentSearch();

    // Navigate to discover page
    const searchUrl = buildSearchUrl();
    console.log('Navigating to:', searchUrl);
    router.push(searchUrl);

    setIsSearching(false);
  }, [buildSearchUrl, router, saveRecentSearch]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  // Apply recent search
  const applyRecentSearch = useCallback((search: RecentSearch) => {
    setFilters(prev => ({
      ...prev,
      location: search.location,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: search.guests > 0 ? Math.max(search.guests, 1) : prev.adults,
    }));
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Add dates';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Calculate nights
  const nights = useMemo(() => {
    if (!filters.checkIn || !filters.checkOut) return 0;
    const checkIn = new Date(filters.checkIn);
    const checkOut = new Date(filters.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));
  }, [filters.checkIn, filters.checkOut]);

  return {
    // State
    filters,
    debouncedLocation,
    recentSearches,
    isSearching,

    // Computed values
    totalGuests,
    guestText,
    hasActiveFilters,
    nights,

    // Actions
    updateFilter,
    updateFilters,
    adjustGuests,
    executeSearch,
    clearFilters,
    clearRecentSearches,
    applyRecentSearch,

    // Utilities
    formatDate,
    buildSearchUrl,
  };
}

export default useSearch;
