'use client';

import { useState } from 'react';
import { MobileNav } from '@/layout';
import { useDiscover } from '@/hooks';
import {
  DiscoverHeader,
  DiscoverFilters,
  DiscoverListings
} from '@/features/discover';
import { PropertyFilter } from '@/components/common';

export default function DiscoverPage() {
  // UI-only state (stays in page)
  const [showFilters, setShowFilters] = useState(false);
  const [showAirbnbFilter, setShowAirbnbFilter] = useState(false);

  // Hook provides all data and business logic
  const {
    filteredListings,
    paginatedListings,
    loading,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    filters,
    airbnbFilters,
    updateFilter,
    setAirbnbFilters,
    syncAirbnbFilters,
    hasActiveFilters,
    clearAllFilters,
    favorites,
    toggleFavorite,
  } = useDiscover();

  // Toggle amenity helper
  const toggleAmenity = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(id => id !== amenityId)
      : [...filters.amenities, amenityId];
    updateFilter('amenities', newAmenities);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <DiscoverHeader
        destination={filters.destination}
        updateFilter={updateFilter}
        onToggleAirbnbFilter={() => setShowAirbnbFilter(true)}
        onToggleMobileFilters={() => setShowFilters(!showFilters)}
      />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="flex gap-4 md:gap-8">
          {/* Filter Sidebar */}
          <DiscoverFilters
            showFilters={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            updateFilter={updateFilter}
            toggleAmenity={toggleAmenity}
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
          />

          {/* Results Section */}
          <DiscoverListings
            filteredListings={filteredListings}
            paginatedListings={paginatedListings}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filters={filters}
            updateFilter={updateFilter}
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Airbnb-style Advanced Filter Modal */}
      <PropertyFilter
        isOpen={showAirbnbFilter}
        onClose={() => setShowAirbnbFilter(false)}
        filters={airbnbFilters}
        onFiltersChange={setAirbnbFilters}
        onApply={(appliedFilters) => {
          syncAirbnbFilters(appliedFilters);
          setShowAirbnbFilter(false);
        }}
      />
      <MobileNav />
    </div>
  );
}
