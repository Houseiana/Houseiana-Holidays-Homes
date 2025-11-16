'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Minus,
  Plus,
  Home,
  Building,
  Mountain,
  Trees
} from 'lucide-react';

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

interface AirbnbFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: (filters: FilterState) => void;
}

// Reusable Components
const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="py-6 border-b border-gray-200 last:border-b-0">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const Counter = ({
  label,
  value,
  onChange,
  min = 0
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) => {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(value > min ? value - 1 : min);

  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-base text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value === min}
          className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600
                     hover:border-black hover:text-black transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>
        <span className="text-base font-medium text-gray-900 w-8 text-center">
          {value === 0 ? 'Any' : value}
        </span>
        <button
          type="button"
          onClick={increment}
          className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600
                     hover:border-black hover:text-black transition"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

const AmenityButton = ({
  label,
  emoji,
  checked,
  onChange
}: {
  label: string;
  emoji: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors h-20 ${
      checked
        ? 'border-black bg-gray-50'
        : 'border-gray-300 hover:border-gray-400'
    }`}
  >
    <span className="text-2xl mb-1">{emoji}</span>
    <span className="text-xs font-medium text-gray-900 text-center">{label}</span>
  </button>
);

export default function AirbnbFilter({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply
}: AirbnbFilterProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenityId: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(id => id !== amenityId)
    }));
  };

  const handlePriceChange = (field: 'priceMin' | 'priceMax', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      propertyType: '',
      priceMin: 0,
      priceMax: 1000,
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      maxGuests: 0,
      minRating: 0,
      amenities: []
    };
    setLocalFilters(clearedFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply(localFilters);
    onClose();
  };

  const propertyTypes = [
    { id: 'house', label: 'House', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'villa', label: 'Villa', icon: Mountain },
    { id: 'condo', label: 'Condo', icon: Building },
    { id: 'townhouse', label: 'Townhouse', icon: Home },
    { id: 'studio', label: 'Studio', icon: Building },
    { id: 'loft', label: 'Loft', icon: Building },
    { id: 'cabin', label: 'Cabin', icon: Trees },
    { id: 'cottage', label: 'Cottage', icon: Home },
    { id: 'hotel_room', label: 'Hotel Room', icon: Building }
  ];

  const amenities = [
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
    { id: 'security', label: 'Security', emoji: '🚪' },
    { id: 'bbq', label: 'BBQ grill', emoji: '🔥' },
    { id: 'jacuzzi', label: 'Jacuzzi', emoji: '🛀' },
    { id: 'private_garden', label: 'Private Garden', emoji: '🌿' },
    { id: 'rooftop', label: 'RoofTop', emoji: '🏢' },
    { id: 'swing', label: 'Swing', emoji: '🪢' }
  ];

  if (!isOpen) return null;

  return (
    <>
      {typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Filters</h1>
                <div className="w-8 h-8"></div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6">
                  {/* Property Type */}
                  <FilterSection title="Property type">
                    <div className="grid grid-cols-5 gap-3">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateFilter('propertyType',
                            localFilters.propertyType === type.id ? '' : type.id
                          )}
                          className={`flex flex-col items-center p-3 border rounded-lg transition-colors h-20 ${
                            localFilters.propertyType === type.id
                              ? 'border-black bg-gray-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <type.icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium text-gray-900 text-center">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Price Range */}
                  <FilterSection title="Price range">
                    <p className="text-sm text-gray-500 mb-4">Nightly prices before fees and taxes</p>

                    {/* Price histogram placeholder */}
                    <div className="h-16 mb-4 flex items-end justify-center space-x-1">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 bg-red-400 rounded-t ${
                            i < 8 || i > 15 ? 'opacity-30' : ''
                          }`}
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
                            value={localFilters.priceMin}
                            onChange={(e) => handlePriceChange('priceMin', e.target.value)}
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
                            value={localFilters.priceMax}
                            onChange={(e) => handlePriceChange('priceMax', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
                            placeholder="1000+"
                          />
                        </div>
                      </div>
                    </div>
                  </FilterSection>

                  {/* Rooms and beds */}
                  <FilterSection title="Rooms and beds">
                    <div className="space-y-4">
                      <Counter
                        label="Bedrooms"
                        value={localFilters.bedrooms}
                        onChange={(value) => updateFilter('bedrooms', value)}
                      />
                      <Counter
                        label="Beds"
                        value={localFilters.beds}
                        onChange={(value) => updateFilter('beds', value)}
                      />
                      <Counter
                        label="Bathrooms"
                        value={localFilters.bathrooms}
                        onChange={(value) => updateFilter('bathrooms', value)}
                      />
                    </div>
                  </FilterSection>

                  {/* Amenities */}
                  <FilterSection title="Amenities">
                    <p className="text-sm text-gray-500 mb-4">What does your place offer?</p>
                    <div className="grid grid-cols-4 gap-3">
                      {amenities.map((amenity) => (
                        <AmenityButton
                          key={amenity.id}
                          label={amenity.label}
                          emoji={amenity.emoji}
                          checked={localFilters.amenities.includes(amenity.id)}
                          onChange={(checked) => toggleAmenity(amenity.id, checked)}
                        />
                      ))}
                    </div>
                  </FilterSection>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium underline hover:text-gray-700 text-gray-900"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}