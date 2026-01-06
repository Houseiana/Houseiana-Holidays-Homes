import React from 'react';
import { X } from 'lucide-react';
import { QuickFilterButton } from './QuickFilterButton';
import { CounterControl } from './CounterControl';
import { DiscoverFilters as DiscoverFiltersType } from '@/hooks/discover/use-discover';

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

interface DiscoverFiltersProps {
  showFilters: boolean;
  onClose: () => void;
  filters: DiscoverFiltersType;
  updateFilter: <K extends keyof DiscoverFiltersType>(key: K, value: DiscoverFiltersType[K]) => void;
  toggleAmenity: (amenityId: string) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export function DiscoverFilters({
  showFilters,
  onClose,
  filters,
  updateFilter,
  toggleAmenity,
  hasActiveFilters,
  clearAllFilters,
}: DiscoverFiltersProps) {
  return (
    <aside className={`lg:w-80 lg:block ${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-24 lg:h-fit`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Filters</h2>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <div className="px-5">
            {/* Quick Filters */}
            <div className="py-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick filters</h3>
              <div className="grid grid-cols-2 gap-2">
                <QuickFilterButton
                  label="Instant"
                  emoji="⚡"
                  isActive={filters.instantBooking}
                  onClick={() => updateFilter('instantBooking', !filters.instantBooking)}
                />
                <QuickFilterButton
                  label="Free Cancel"
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
                  label="Pets"
                  emoji="🐕"
                  isActive={filters.amenities.includes('pet_friendly')}
                  onClick={() => toggleAmenity('pet_friendly')}
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="py-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property type</h3>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateFilter('propertyType', filters.propertyType === type.id ? '' : type.id)}
                    className={`flex items-center justify-center p-3 border rounded-xl transition-all duration-200 text-sm font-medium active:scale-95 ${
                      filters.propertyType === type.id 
                        ? 'border-black bg-gray-50 shadow-sm ring-1 ring-black' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="py-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Price range</h3>
              <p className="text-xs text-gray-500 mb-6">Nightly prices before fees and taxes</p>

              {/* Histogram */}
              <div className="h-12 mb-3 flex items-end justify-center px-2 gap-[2px]">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-300 ${i >= 8 && i <= 16 ? 'bg-primary-500/80' : 'bg-gray-200'}`}
                    style={{ height: `${Math.max(10, Math.random() * 100)}%` }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-wider font-medium text-gray-500 mb-1.5">Minimum</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">$</span>
                    <input
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 transition-all outline-none"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="text-gray-400 mt-6">-</div>
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-wider font-medium text-gray-500 mb-1.5">Maximum</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">$</span>
                    <input
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 10000)}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 transition-all outline-none"
                      placeholder="1000+"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms and beds */}
            <div className="py-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rooms and beds</h3>
              <div className="space-y-1">
                <CounterControl
                  label="Bedrooms"
                  value={filters.bedrooms}
                  onChange={(value) => updateFilter('bedrooms', value)}
                  min={0}
                  max={10}
                />
                <CounterControl
                  label="Bathrooms"
                  value={filters.bathrooms}
                  onChange={(value) => updateFilter('bathrooms', value)}
                  min={0}
                  max={5}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
              <p className="text-sm text-gray-500 mb-4">Essential features for your stay</p>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all duration-200 h-[4.5rem] active:scale-95 ${
                      filters.amenities.includes(amenity.id) 
                        ? 'border-black bg-gray-50 shadow-sm ring-1 ring-black' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <span className="text-xl mb-1">{amenity.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {hasActiveFilters && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm sticky bottom-0 z-10">
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
