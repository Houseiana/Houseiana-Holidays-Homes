'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

// Types
export interface DiscoverListing {
  id: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sleeps: number;
  rating: number;
  reviewCount: number;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  image: string;
  latitude?: number;
  longitude?: number;
}

export interface DiscoverFilters {
  destination: string;
  propertyType: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  minRating: number;
  sortBy: string;
  adults: number;
  children: number;
  infants: number;
  amenities: string[];
  instantBooking: boolean;
  freeCancellation: boolean;
}

export interface AirbnbFilterState {
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

export type DiscoverViewMode = 'grid' | 'list' | 'map';

interface UseDiscoverReturn {
  // Data
  listings: DiscoverListing[];
  filteredListings: DiscoverListing[];
  paginatedListings: DiscoverListing[];
  loading: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;

  // View
  viewMode: DiscoverViewMode;
  setViewMode: (mode: DiscoverViewMode) => void;

  // Filters
  filters: DiscoverFilters;
  airbnbFilters: AirbnbFilterState;
  updateFilter: <K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) => void;
  setAirbnbFilters: React.Dispatch<React.SetStateAction<AirbnbFilterState>>;
  syncAirbnbFilters: (appliedFilters: AirbnbFilterState) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;

  // Favorites
  favorites: Set<string>;
  toggleFavorite: (propertyId: string) => void;
}

const DEFAULT_FILTERS: DiscoverFilters = {
  destination: '',
  propertyType: '',
  priceMin: 0,
  priceMax: 1000,
  bedrooms: 0,
  beds: 0,
  bathrooms: 0,
  minRating: 0,
  sortBy: 'recommended',
  adults: 2,
  children: 0,
  infants: 0,
  amenities: [],
  instantBooking: false,
  freeCancellation: false,
};

const DEFAULT_AIRBNB_FILTERS: AirbnbFilterState = {
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

export function useDiscover(): UseDiscoverReturn {
  // Data state
  const [allListings, setAllListings] = useState<DiscoverListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // View state
  const [viewMode, setViewMode] = useState<DiscoverViewMode>('grid');

  // Filter state
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [airbnbFilters, setAirbnbFilters] = useState<AirbnbFilterState>(DEFAULT_AIRBNB_FILTERS);

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        // Get search params from URL
        const params = new URLSearchParams(window.location.search);
        const location = params.get('location') || '';
        const checkin = params.get('checkin') || '';
        const checkout = params.get('checkout') || '';
        const guests = params.get('guests') || '';

        // Build API URL with query parameters
        const queryParams = new URLSearchParams();
        if (location) queryParams.append('location', location);
        if (checkin) queryParams.append('checkin', checkin);
        if (checkout) queryParams.append('checkout', checkout);
        if (guests) queryParams.append('guests', guests);

        const apiUrl = '/api/properties/search?' + queryParams.toString();
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success && data.properties) {
          setAllListings(data.properties);

          // Update filters with URL params
          if (location) {
            setFilters(prev => ({ ...prev, destination: location }));
          }
          if (guests) {
            setFilters(prev => ({ ...prev, adults: parseInt(guests) || 2 }));
          }
        } else {
          setAllListings([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setAllListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    if (!allListings || allListings.length === 0) return [];
    let filtered = [...allListings];

    // Apply destination filter
    if (filters.destination) {
      filtered = filtered.filter(listing =>
        listing.location.toLowerCase().includes(filters.destination.toLowerCase()) ||
        listing.title.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    // Apply price filter
    if (filters.priceMin > 0 || filters.priceMax < 1000) {
      filtered = filtered.filter(listing =>
        listing.price >= filters.priceMin && listing.price <= filters.priceMax
      );
    }

    // Apply bedroom filter
    if (filters.bedrooms > 0) {
      filtered = filtered.filter(listing => listing.beds >= filters.bedrooms);
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(listing => listing.rating >= filters.minRating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default: // recommended
        break;
    }

    return filtered;
  }, [allListings, filters]);

  // Pagination
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(start, start + itemsPerPage);
  }, [filteredListings, currentPage]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  // Check for active filters
  const hasActiveFilters = useMemo(() => {
    return filters.destination !== '' ||
           filters.propertyType !== '' ||
           filters.priceMin > 0 ||
           filters.priceMax < 1000 ||
           filters.bedrooms > 0 ||
           filters.minRating > 0 ||
           filters.instantBooking ||
           filters.freeCancellation ||
           filters.amenities.length > 0;
  }, [filters]);

  // Update single filter
  const updateFilter = useCallback(<K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // Sync airbnb filters with main filters
  const syncAirbnbFilters = useCallback((appliedFilters: AirbnbFilterState) => {
    setAirbnbFilters(appliedFilters);
    setFilters(prev => ({
      ...prev,
      propertyType: appliedFilters.propertyType,
      priceMin: appliedFilters.priceMin,
      priceMax: appliedFilters.priceMax,
      bedrooms: appliedFilters.bedrooms,
      bathrooms: appliedFilters.bathrooms,
      minRating: appliedFilters.minRating,
      amenities: appliedFilters.amenities,
    }));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  }, []);

  return {
    // Data
    listings: allListings,
    filteredListings,
    paginatedListings,
    loading,

    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,

    // View
    viewMode,
    setViewMode,

    // Filters
    filters,
    airbnbFilters,
    updateFilter,
    setAirbnbFilters,
    syncAirbnbFilters,
    hasActiveFilters,
    clearAllFilters,

    // Favorites
    favorites,
    toggleFavorite,
  };
}
