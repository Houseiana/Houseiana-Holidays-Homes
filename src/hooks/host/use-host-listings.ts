'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

// Types
export interface Listing {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  status: 'active' | 'paused' | 'draft' | 'inactive';
  instantBook: boolean;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  basePrice: number;
  currency: string;
  images: string[];
  imageCount: number;
  rating: number | null;
  reviewCount: number;
  views: number;
  viewsTrend: number;
  bookings: {
    upcoming: number;
    total: number;
  };
  earnings: {
    thisMonth: number;
    total: number;
  };
  occupancy: number;
  lastUpdated: string;
  createdAt: string;
  amenities: string[];
  superhostBadge: boolean;
  guestFavorite: boolean;
  completionPercent?: number;
  pauseReason?: string;
  deactivationReason?: string;
}

export interface ListingStats {
  total: number;
  active: number;
  paused: number;
  draft: number;
  inactive: number;
  totalViews: number;
  totalBookings: number;
  avgRating: string;
  totalEarnings: number;
}

export type ListingStatus = 'all' | 'active' | 'paused' | 'draft' | 'inactive';
export type ListingSortBy = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'rating' | 'bookings';
export type ViewMode = 'grid' | 'list';

interface UseHostListingsReturn {
  // Data
  listings: Listing[];
  filteredListings: Listing[];
  stats: ListingStats;
  loading: boolean;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: ListingStatus;
  setSelectedStatus: (status: ListingStatus) => void;
  sortBy: ListingSortBy;
  setSortBy: (sort: ListingSortBy) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Selection
  selectedListings: string[];
  toggleListingSelection: (id: string) => void;
  selectAllListings: () => void;
  clearSelection: () => void;

  // Actions
  refetch: () => Promise<void>;
  bulkActivate: () => Promise<void>;
  bulkPause: () => Promise<void>;
  bulkDelete: () => Promise<void>;
}

// Helper function to map API properties to Listing type
function mapPropertiesToListings(properties: any[]): Listing[] {
  return properties.map((prop: any) => {
    const statusMap: Record<string, 'active' | 'paused' | 'draft' | 'inactive'> = {
      'PUBLISHED': 'active',
      'DRAFT': 'draft',
      'PAUSED': 'paused',
      'INACTIVE': 'inactive',
    };
    const uiStatus = statusMap[prop.status] || 'draft';

    const photos = Array.isArray(prop.photos) ? prop.photos : [];
    const imageCount = photos.length;

    return {
      id: prop.id,
      title: prop.title,
      location: `${prop.city}, ${prop.country}`,
      propertyType: prop.propertyType || 'Property',
      status: uiStatus,
      instantBook: prop.instantBook || false,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      maxGuests: prop.guests || prop.maxGuests || 1,
      basePrice: prop.basePrice || prop.pricePerNight || 0,
      currency: prop.currency || 'QAR',
      images: photos,
      imageCount: imageCount,
      rating: prop.averageRating || null,
      reviewCount: prop.totalReviews || prop._count?.reviews || 0,
      views: 0,
      viewsTrend: 0,
      bookings: {
        upcoming: 0,
        total: prop._count?.bookings || 0,
      },
      earnings: {
        thisMonth: 0,
        total: prop.revenue || 0,
      },
      occupancy: prop.occupancy || 0,
      lastUpdated: prop.updatedAt || new Date().toISOString(),
      createdAt: prop.createdAt || new Date().toISOString(),
      amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
      superhostBadge: false,
      guestFavorite: (prop._count?.favorites || 0) > 10,
      completionPercent: uiStatus === 'draft' ? 65 : undefined,
    };
  });
}

export function useHostListings(userId?: string): UseHostListingsReturn {
  // Data state
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>('all');
  const [sortBy, setSortBy] = useState<ListingSortBy>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Selection state
  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/properties?ownerId=${userId}`);
      const data = await response.json();

      if (data.success && data.properties) {
        const mappedListings = mapPropertiesToListings(data.properties);
        setListings(mappedListings);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Calculate stats
  const stats = useMemo<ListingStats>(() => {
    const ratedListings = listings.filter(l => l.rating);
    const avgRating = ratedListings.length > 0
      ? (ratedListings.reduce((sum, l) => sum + (l.rating || 0), 0) / ratedListings.length).toFixed(2)
      : '0.00';

    return {
      total: listings.length,
      active: listings.filter(l => l.status === 'active').length,
      paused: listings.filter(l => l.status === 'paused').length,
      draft: listings.filter(l => l.status === 'draft').length,
      inactive: listings.filter(l => l.status === 'inactive').length,
      totalViews: listings.reduce((sum, l) => sum + l.views, 0),
      totalBookings: listings.reduce((sum, l) => sum + l.bookings.upcoming, 0),
      avgRating,
      totalEarnings: listings.reduce((sum, l) => sum + l.earnings.thisMonth, 0),
    };
  }, [listings]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = listings;

    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(l => l.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.location.toLowerCase().includes(query) ||
        l.propertyType.toLowerCase().includes(query)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_high':
          return b.basePrice - a.basePrice;
        case 'price_low':
          return a.basePrice - b.basePrice;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'bookings':
          return b.bookings.total - a.bookings.total;
        default:
          return 0;
      }
    });

    return result;
  }, [listings, selectedStatus, searchQuery, sortBy]);

  // Selection handlers
  const toggleListingSelection = useCallback((listingId: string) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  }, []);

  const selectAllListings = useCallback(() => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  }, [selectedListings.length, filteredListings]);

  const clearSelection = useCallback(() => {
    setSelectedListings([]);
  }, []);

  // Bulk actions
  const bulkActivate = useCallback(async () => {
    if (selectedListings.length === 0) return;

    try {
      const updatePromises = selectedListings.map(id =>
        fetch(`/api/properties`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'PUBLISHED', isActive: true }),
        })
      );

      await Promise.all(updatePromises);
      await fetchListings();
      setSelectedListings([]);
      alert(`${selectedListings.length} listing(s) activated successfully`);
    } catch (error) {
      console.error('Error activating listings:', error);
      alert('Failed to activate listings');
    }
  }, [selectedListings, fetchListings]);

  const bulkPause = useCallback(async () => {
    if (selectedListings.length === 0) return;

    try {
      const updatePromises = selectedListings.map(id =>
        fetch(`/api/properties`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'PAUSED', isActive: false }),
        })
      );

      await Promise.all(updatePromises);
      await fetchListings();
      setSelectedListings([]);
      alert(`${selectedListings.length} listing(s) paused successfully`);
    } catch (error) {
      console.error('Error pausing listings:', error);
      alert('Failed to pause listings');
    }
  }, [selectedListings, fetchListings]);

  const bulkDelete = useCallback(async () => {
    if (selectedListings.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedListings.length} listing(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = selectedListings.map(id =>
        fetch(`/api/properties?id=${id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      await fetchListings();
      setSelectedListings([]);
      alert(`${selectedListings.length} listing(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting listings:', error);
      alert('Failed to delete listings');
    }
  }, [selectedListings, fetchListings]);

  return {
    // Data
    listings,
    filteredListings,
    stats,
    loading,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,

    // Selection
    selectedListings,
    toggleListingSelection,
    selectAllListings,
    clearSelection,

    // Actions
    refetch: fetchListings,
    bulkActivate,
    bulkPause,
    bulkDelete,
  };
}
