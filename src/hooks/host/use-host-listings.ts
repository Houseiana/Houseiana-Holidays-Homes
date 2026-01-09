'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { PropertyService } from '@/features/property/api/property.service';

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
  deleteListing: (id: string) => Promise<void>;
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
  const fetchListings = useCallback(async (query?: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const params: any = { hostId: userId };
      // Use the passed query or fallback to state (though with debounce, passed query is preferred)
      const searchTerm = query !== undefined ? query : searchQuery;
      if (searchTerm) params.searchQuery = searchTerm;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const response = await PropertyService.getAll(params);
      
      if (response.success && response.data) {
        // Handle both paginated response and direct array (just in case)
        const properties = 'data' in response.data ? response.data.data : response.data;
        // The API might return 'properties' directly as well based on previous code
        const items = Array.isArray(properties) ? properties : (response.data as any).properties || [];
        
        const mappedListings = mapPropertiesToListings(items);
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
  }, [userId, selectedStatus]); // Removed searchQuery from dependencies

  // Initial fetch and status changes
  useEffect(() => {
    fetchListings(searchQuery);
  }, [fetchListings, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchListings]);

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

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${selectedListings.length} listing(s)? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const deletePromises = selectedListings.map(id =>
        PropertyService.delete(id)
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error('Failed deletions:', failed);
        throw new Error(failed[0].error || 'Failed to delete listings');
      }

      await fetchListings();
      setSelectedListings([]);
      Swal.fire('Deleted!', `${selectedListings.length} listing(s) deleted successfully`, 'success');
    } catch (error: any) {
      console.error('Error deleting listings:', error);
      Swal.fire('Error!', error.message || 'Failed to delete listings', 'error');
    }
  }, [selectedListings, fetchListings]);

  const deleteListing = useCallback(async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await PropertyService.delete(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete listing');
      }

      await fetchListings();
      // If the deleted item was selected, remove it from selection
      if (selectedListings.includes(id)) {
        setSelectedListings(prev => prev.filter(itemId => itemId !== id));
      }
      Swal.fire('Deleted!', 'Your listing has been deleted.', 'success');
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      Swal.fire('Error!', error.message || 'Failed to delete listing', 'error');
    }
  }, [fetchListings, selectedListings]);

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
    deleteListing,
  };
}
