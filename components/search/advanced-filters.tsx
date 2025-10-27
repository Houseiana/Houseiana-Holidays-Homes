'use client';

import { useState } from 'react';
import { X, Minus, Plus, DollarSign, Star, Bed, Users, Home, Building, Mountain, Trees, Wifi, Car, Coffee, Waves, UtensilsCrossed, Wind, Tv, Dumbbell, Bath, Snowflake, Flame, Utensils, WashingMachine } from 'lucide-react';

interface AdvancedFilters {
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

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onApply: () => void;
}

const propertyTypes = [
  { id: 'any', name: 'Any type', icon: Home },
  { id: 'house', name: 'House', icon: Home },
  { id: 'apartment', name: 'Apartment', icon: Building },
  { id: 'villa', name: 'Villa', icon: Mountain },
  { id: 'cabin', name: 'Cabin', icon: Trees }
];

const amenities = [
  { id: 'wifi', name: 'Wifi', icon: Wifi },
  { id: 'parking', name: 'Free parking', icon: Car },
  { id: 'kitchen', name: 'Kitchen', icon: Coffee },
  { id: 'pool', name: 'Pool', icon: Waves },
  { id: 'gym', name: 'Gym', icon: Dumbbell },
  { id: 'spa', name: 'Spa', icon: Bath },
  { id: 'ac', name: 'Air conditioning', icon: Snowflake },
  { id: 'heating', name: 'Heating', icon: Flame },
  { id: 'breakfast', name: 'Breakfast', icon: Utensils },
  { id: 'laundry', name: 'Washer', icon: WashingMachine },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'workspace', name: 'Dedicated workspace', icon: Wind }
];

const CounterInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100">
    <span className="font-medium text-gray-900">{label}</span>
    <div className="flex items-center space-x-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
          value <= min
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800'
        }`}
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center font-medium text-gray-900">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
          value >= max
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800'
        }`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function AdvancedFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply
}: AdvancedFiltersProps) {
  if (!isOpen) return null;

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleAmenity = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(id => id !== amenityId)
      : [...filters.amenities, amenityId];

    updateFilter('amenities', newAmenities);
  };

  const clearFilters = () => {
    onFiltersChange({
      propertyType: 'any',
      priceMin: 0,
      priceMax: 1000,
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      maxGuests: 0,
      minRating: 0,
      amenities: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Property Type */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property type</h3>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => updateFilter('propertyType', type.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      filters.propertyType === type.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <div className="font-medium text-sm">{type.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 1000)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000+"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rooms and guests */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rooms and guests</h3>
            <div className="space-y-2">
              <CounterInput
                label="Bedrooms"
                value={filters.bedrooms}
                onChange={(value) => updateFilter('bedrooms', value)}
                max={8}
              />
              <CounterInput
                label="Beds"
                value={filters.beds}
                onChange={(value) => updateFilter('beds', value)}
                max={16}
              />
              <CounterInput
                label="Bathrooms"
                value={filters.bathrooms}
                onChange={(value) => updateFilter('bathrooms', value)}
                max={8}
              />
              <CounterInput
                label="Guests"
                value={filters.maxGuests}
                onChange={(value) => updateFilter('maxGuests', value)}
                max={16}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest rating</h3>
            <div className="flex flex-wrap gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', rating)}
                  className={`flex items-center px-4 py-2 border rounded-full transition-colors ${
                    filters.minRating === rating
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-1 gap-2">
              {amenities.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = filters.amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center p-3 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
            <button
              onClick={onApply}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}