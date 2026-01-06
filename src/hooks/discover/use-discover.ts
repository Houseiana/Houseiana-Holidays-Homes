'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import BackendAPI from '@/lib/api/backend-api';
import Swal from 'sweetalert2';

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
  priceMin: 20,
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
  // Sync filters from URL Search Params
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only update if the URL params differ from current filters to avoid loops
    // Ideally we assume URL is source of truth if it changes
    // But we also have local state.
    // Let's parse URL and set filters.
    
    // NOTE: This implementation assumes URL is the driver.
    // If updateFilter updates state directly, we might double-update if we also push to URL.
    // But HomeHeader pushes to URL.
    
    // We'll read from searchParams every time they change.
    const initialFilters = { ...DEFAULT_FILTERS };
    
    if (searchParams.get('location')) initialFilters.destination = searchParams.get('location')!;
    if (searchParams.get('guests')) initialFilters.adults = parseInt(searchParams.get('guests')!) || 1;
    if (searchParams.get('adults')) initialFilters.adults = parseInt(searchParams.get('adults')!);
    if (searchParams.get('children')) initialFilters.children = parseInt(searchParams.get('children')!);
    if (searchParams.get('infants')) initialFilters.infants = parseInt(searchParams.get('infants')!);
    if (searchParams.get('propertyType')) initialFilters.propertyType = searchParams.get('propertyType')!;
    if (searchParams.get('priceMin')) initialFilters.priceMin = parseInt(searchParams.get('priceMin')!);
    if (searchParams.get('priceMax')) initialFilters.priceMax = parseInt(searchParams.get('priceMax')!);
    
    if (searchParams.get('bedrooms')) initialFilters.bedrooms = parseInt(searchParams.get('bedrooms')!);
    if (searchParams.get('beds')) initialFilters.beds = parseInt(searchParams.get('beds')!);
    if (searchParams.get('bathrooms')) initialFilters.bathrooms = parseInt(searchParams.get('bathrooms')!);
    
    // We only set filters if they are significantly different to avoid resetting transient state
    // For now, simpler is: Set filters from URL always.
    setFilters(initialFilters);
    
    setAirbnbFilters(prev => ({
      ...prev,
      propertyType: initialFilters.propertyType,
      priceMin: initialFilters.priceMin || prev.priceMin,
      priceMax: initialFilters.priceMax || prev.priceMax,
      bedrooms: initialFilters.bedrooms,
      beds: initialFilters.beds,
      bathrooms: initialFilters.bathrooms,
    }));

  }, [searchParams]);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        const checkin = searchParams.get('checkin') || undefined;
        const checkout = searchParams.get('checkout') || undefined;
        
        // We still read checkin/checkout from URL as they are not in our main filters object yet?
        // Wait, filters object doesn't have dates. We should add them or keep reading from URL?
        // If we clear filters, we probably want to clear dates too. 
        // But the current implementation of filters interface doesn't have dates.
        // Let's assume dates stick to URL for now, but other filters shouldn't fallback.
        // Actually, if clearAllFilters is called, we should likely clear the URL to remove dates too.
        
        const response = await BackendAPI.Property.publicSearchFilter({
          location: filters.destination || undefined,
          checkIn: checkin, 
          checkOut: checkout,
          guests: (filters.adults + filters.children) || undefined,
          adults: filters.adults || undefined,
          children: filters.children || undefined,
          infants: filters.infants || undefined,
          minPrice: filters.priceMin > 0 ? filters.priceMin : undefined,
          maxPrice: filters.priceMax < 1000 ? filters.priceMax : undefined,
          propertyType: filters.propertyType || undefined,
          bedrooms: filters.bedrooms || undefined,
          beds: filters.beds || undefined,
          bathrooms: filters.bathrooms || undefined,
          minRating: filters.minRating || undefined,
          amenities: filters.amenities,
          page: currentPage,
          limit: itemsPerPage,
        });

        if (response.success && response.data?.properties) {
          setAllListings(response.data.properties);
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
  }, [filters, currentPage]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    if (!allListings || allListings.length === 0) return [];
    let filtered = [...allListings];

    // Apply destination filter
    if (filters.destination) {
      const searchTerm = filters.destination.toLowerCase();
      filtered = filtered.filter(listing =>
        (listing.location || '').toLowerCase().includes(searchTerm) ||
        (listing.title || '').toLowerCase().includes(searchTerm)
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
    setAirbnbFilters(DEFAULT_AIRBNB_FILTERS);
    setCurrentPage(1);
    
    // Clear URL params without refresh
    window.history.pushState({}, '', window.location.pathname);
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
  const { userId } = useAuth();

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'You must be logged in to toggle a favorite.',
      });
      return;
    };

    // Optimistic update
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });

    try {
      await BackendAPI.User.toggleFavorite(userId, propertyId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert on error
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(propertyId)) {
          newFavorites.delete(propertyId);
        } else {
          newFavorites.add(propertyId);
        }
        return newFavorites;
      });
    }
  }, [userId]);

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
