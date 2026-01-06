import React from 'react';
import dynamic from 'next/dynamic';
import { Grid, List, Map, X, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { PropertyGridSkeleton, MapSkeleton } from '@/components/ui/loaders/skeleton';
import { DiscoverFilters as DiscoverFiltersType, DiscoverViewMode } from '@/hooks/discover/use-discover';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import PropertyCard from '@/features/home/components/PropertyCard';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
];

// Dynamically import GoogleMapsMultiView to avoid SSR issues
const GoogleMapsMultiView = dynamic(() => import('@/components/ui/map/GoogleMapsMultiView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface DiscoverListingsProps {
  filteredListings: any[];
  paginatedListings: any[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  viewMode: DiscoverViewMode;
  setViewMode: (mode: DiscoverViewMode) => void;
  filters: DiscoverFiltersType;
  updateFilter: <K extends keyof DiscoverFiltersType>(key: K, value: DiscoverFiltersType[K]) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
}

export function DiscoverListings({
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
  updateFilter,
  hasActiveFilters,
  clearAllFilters,
  favorites,
  toggleFavorite,
}: DiscoverListingsProps) {
  return (
    <main className="flex-1">
      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700">
            {filteredListings.length} {paginatedListings.length > 1 ? 'Homes' : 'Home'} {filters.destination && 'within'} {filters.destination}
          </h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sort Dropdown */}
          <div className="relative z-20">
            <Listbox value={filters.sortBy} onChange={(value) => updateFilter('sortBy', value)}>
              {({ open }) => (
                <>
                  <ListboxButton className="relative flex items-center justify-between w-full sm:w-[200px] pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200">
                    <span className="block truncate text-left">
                      {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label || 'Sort by'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute right-0 mt-1 max-h-60 w-full sm:w-[240px] overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm origin-top-right transition-all transform opacity-100 scale-100 p-1">
                    {SORT_OPTIONS.map((option) => (
                      <ListboxOption
                        key={option.value}
                        value={option.value}
                        className={({ active, selected }) =>
                          `relative cursor-pointer select-none py-2.5 pl-3 pr-9 rounded-lg transition-colors ${
                            active ? 'bg-gray-50 text-black' : 'text-gray-900'
                          } ${selected ? 'bg-gray-50 font-medium' : 'font-normal'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {option.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </>
              )}
            </Listbox>
          </div>

          {/* View Toggle - Removed Map Button */}
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
          {(filters.priceMin > 0 || filters.priceMax < 10000) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              ${filters.priceMin} - ${filters.priceMax}
              <button onClick={() => { updateFilter('priceMin', 0); updateFilter('priceMax', 10000); }}>
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

      {/* Split Layout: Listings (Left) + Map (Right) */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Listings Column */}
        <div className="w-full lg:w-3/5 overflow-y-auto pr-2">
          {loading ? (
            <PropertyGridSkeleton count={6} />
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
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-6'}>
                {paginatedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    property={listing}
                    onToggle={toggleFavorite}
                  />
                ))}
              </div>

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
            </>
          )}
        </div>

        {/* Map Column - Sticky on Desktop */}
        <div className="hidden lg:block w-3/5 h-full sticky top-24">
          <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <GoogleMapsMultiView
              properties={filteredListings}
              center={[25.2854, 51.5310]}
              zoom={12}
              onPropertyClick={(propertyId) => {
                window.location.href = `/property/${propertyId}`;
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
