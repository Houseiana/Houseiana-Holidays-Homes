'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { PropertyTypeSection } from './PropertyTypeSection';
import { PriceRangeSection } from './PriceRangeSection';
import { RoomsAndBedsSection } from './RoomsAndBedsSection';
import { AmenitiesSection } from './AmenitiesSection';

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

export interface PropertyFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: (filters: FilterState) => void;
}

export default function PropertyFilter({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply
}: PropertyFilterProps) {
    console.log(filters);
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

  const handlePriceChange = (field: 'priceMin' | 'priceMax', value: number) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      propertyType: '',
      priceMin: 20,
      priceMax: 10000,
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
                  <PropertyTypeSection 
                    selectedType={localFilters.propertyType}
                    onChange={(type) => updateFilter('propertyType', type)}
                  />

                  {/* Price Range */}
                  <PriceRangeSection 
                    priceMin={localFilters.priceMin}
                    priceMax={localFilters.priceMax}
                    onPriceChange={handlePriceChange}
                  />

                  {/* Rooms and beds */}
                  <RoomsAndBedsSection 
                    bedrooms={localFilters.bedrooms}
                    beds={localFilters.beds}
                    bathrooms={localFilters.bathrooms}
                    onUpdate={updateFilter}
                  />

                  {/* Amenities */}
                  <AmenitiesSection 
                    selectedAmenities={localFilters.amenities}
                    onToggle={toggleAmenity}
                  />
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
