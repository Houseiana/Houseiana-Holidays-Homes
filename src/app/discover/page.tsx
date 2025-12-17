'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Filter, Grid, List, Map, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AirbnbFilter, { FilterState } from '@/components2/common/filters/airbnb-filter';
import { PropertyCard } from '@/components2/common/cards/property-card';
import { PropertyGridSkeleton, MapSkeleton } from '@/components2/ui/loaders/skeleton';
import { MobileNav } from '@/layout/Navbar/mobile-nav';
import { useDiscover, DiscoverFilters } from '@/hooks';

// Dynamically import GoogleMapsMultiView to avoid SSR issues
const GoogleMapsMultiView = dynamic(() => import('@/components2/ui/map/GoogleMapsMultiView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Property Types Configuration
const PROPERTY_TYPES = [
  { id: 'house', label: 'House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'condo', label: 'Condo' },
  { id: 'townhouse', label: 'Townhouse' },
  { id: 'studio', label: 'Studio' },
  { id: 'loft', label: 'Loft' },
  { id: 'cabin', label: 'Cabin' },
  { id: 'cottage', label: 'Cottage' },
  { id: 'hotel_room', label: 'Hotel Room' },
];

// Amenities Configuration
const AMENITIES = [
  { id: 'wifi', label: 'WiFi', emoji: '📶' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'washer', label: 'Washer', emoji: '🧺' },
  { id: 'dryer', label: 'Dryer', emoji: '🌪️' },
  { id: 'air_conditioning', label: 'Air conditioning', emoji: '❄️' },
  { id: 'heating', label: 'Heating', emoji: '🔥' },
  { id: 'workspace', label: 'Workspace', emoji: '💻' },
  { id: 'tv', label: 'TV', emoji: '📺' },
  { id: 'parking', label: 'Free parking', emoji: '🅿️' },
  { id: 'pool', label: 'Pool', emoji: '🏊' },
  { id: 'gym', label: 'Gym', emoji: '🏋️' },
  { id: 'hot_tub', label: 'Hot tub', emoji: '🛁' },
  { id: 'jacuzzi', label: 'Jacuzzi', emoji: '🛀' },
  { id: 'private_garden', label: 'Private Garden', emoji: '🌿' },
  { id: 'rooftop', label: 'RoofTop', emoji: '🏢' },
  { id: 'swing', label: 'Swing', emoji: '🪢' },
  { id: 'pet_friendly', label: 'Pet-friendly', emoji: '🐕' },
];

// Quick Filter Button Component
interface QuickFilterButtonProps {
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}

function QuickFilterButton({ label, emoji, isActive, onClick }: QuickFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
        isActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <span className="text-lg mr-2">{emoji}</span>
      {label}
    </button>
  );
}

// Counter Control Component
interface CounterControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

function CounterControl({ label, value, onChange, min = 0 }: CounterControlProps) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-base text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value === min}
          className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:border-black hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm">−</span>
        </button>
        <span className="text-base font-medium text-gray-900 w-8 text-center">
          {value === 0 ? 'Any' : value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:border-black hover:text-black transition"
        >
          <span className="text-sm">+</span>
        </button>
      </div>
    </div>
  );
}

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
      {/* Search Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-area-inset-top">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {/* Search Input */}
            <div className="flex-1 md:max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={filters.destination}
                  onChange={(e) => updateFilter('destination', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setShowAirbnbFilter(true)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 whitespace-nowrap flex-shrink-0"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Advanced Filters</span>
                <span className="sm:hidden">Filters</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 whitespace-nowrap flex-shrink-0"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Quick Filters</span>
                <span className="sm:hidden">More</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="flex gap-4 md:gap-8">
          {/* Filter Sidebar */}
          <aside className={`lg:w-80 lg:block ${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-24 lg:h-fit`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
                <div className="px-4 sm:px-5 md:px-6">
                  {/* Quick Filters */}
                  <div className="py-4 sm:py-5 md:py-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick filters</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <QuickFilterButton
                        label="Instant Booking"
                        emoji="⚡"
                        isActive={filters.instantBooking}
                        onClick={() => updateFilter('instantBooking', !filters.instantBooking)}
                      />
                      <QuickFilterButton
                        label="Free cancellation"
                        emoji="🆓"
                        isActive={filters.freeCancellation}
                        onClick={() => updateFilter('freeCancellation', !filters.freeCancellation)}
                      />
                      <QuickFilterButton
                        label="Pool"
                        emoji="🏊"
                        isActive={filters.amenities.includes('pool')}
                        onClick={() => toggleAmenity('pool')}
                      />
                      <QuickFilterButton
                        label="Pet-friendly"
                        emoji="🐕"
                        isActive={filters.amenities.includes('pet_friendly')}
                        onClick={() => toggleAmenity('pet_friendly')}
                      />
                      <QuickFilterButton
                        label="WiFi"
                        emoji="📶"
                        isActive={filters.amenities.includes('wifi')}
                        onClick={() => toggleAmenity('wifi')}
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Property type</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateFilter('propertyType', filters.propertyType === type.id ? '' : type.id)}
                          className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                            filters.propertyType === type.id ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Price range</h2>
                    <p className="text-sm text-gray-500 mb-4">Nightly prices before fees and taxes</p>

                    <div className="h-16 mb-4 flex items-end justify-center space-x-1">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 bg-red-400 rounded-t ${i < 8 || i > 15 ? 'opacity-30' : ''}`}
                          style={{ height: `${Math.random() * 40 + 20}px` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Minimum</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={filters.priceMin}
                            onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="w-4 h-px bg-gray-300 mt-6"></div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Maximum</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={filters.priceMax}
                            onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 1000)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
                            placeholder="1000+"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rooms and beds */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Rooms and beds</h2>
                    <div className="space-y-4">
                      <CounterControl
                        label="Bedrooms"
                        value={filters.bedrooms}
                        onChange={(value) => updateFilter('bedrooms', value)}
                      />
                      <CounterControl
                        label="Bathrooms"
                        value={filters.bathrooms}
                        onChange={(value) => updateFilter('bathrooms', value)}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                    <p className="text-sm text-gray-500 mb-4">What does your place offer?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {AMENITIES.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors h-16 ${
                            filters.amenities.includes(amenity.id) ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <span className="text-lg mb-1">{amenity.emoji}</span>
                          <span className="text-xs font-medium text-gray-900 text-center">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {hasActiveFilters && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Results Section */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {filteredListings.length} vacation rentals
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {/* Sort Dropdown */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                </select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2.5 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Applied Filters */}
            {hasActiveFilters && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700">Applied filters:</span>
                {filters.destination && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {filters.destination}
                    <button onClick={() => updateFilter('destination', '')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {(filters.priceMin > 0 || filters.priceMax < 1000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    ${filters.priceMin} - ${filters.priceMax}
                    <button onClick={() => { updateFilter('priceMin', 0); updateFilter('priceMax', 1000); }}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Grid/List */}
            {loading ? (
              <PropertyGridSkeleton count={9} />
            ) : viewMode === 'map' ? (
              <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <GoogleMapsMultiView
                  properties={filteredListings}
                  center={[25.2854, 51.5310]}
                  zoom={12}
                  onPropertyClick={(propertyId) => {
                    window.location.href = `/property/${propertyId}`;
                  }}
                />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {paginatedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    property={listing}
                    isFavorite={favorites.has(listing.id)}
                    onToggleFavorite={toggleFavorite}
                    layout={viewMode}
                    showViewButton={false}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredListings.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredListings.length)} of {filteredListings.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
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
      <AirbnbFilter
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
