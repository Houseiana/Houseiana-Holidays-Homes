import React from 'react';
import { FilterSection } from './FilterSection';

interface PriceRangeSectionProps {
  priceMin: number;
  priceMax: number;
  onPriceChange: (field: 'priceMin' | 'priceMax', value: number) => void;
}

export const PriceRangeSection = ({ priceMin, priceMax, onPriceChange }: PriceRangeSectionProps) => {
  const handleInputChange = (field: 'priceMin' | 'priceMax', value: string) => {
     let newValue = value === '' ? 0 : parseInt(value);
     if (isNaN(newValue)) newValue = 0;
     if (newValue > 10000) newValue = 10000;
     onPriceChange(field, newValue);
  };

  const handleBlur = (field: 'priceMin' | 'priceMax') => {
      // We need to implement the blur logic here or pass it down. 
      // For simplicity in splitting, I'll keep the logic simple here or assume the parent handles cleanup if needed,
      // but to replicate exact behavior, let's keep validation logic in the component or simple change.
      // Wait, the parent `PropertyFilter` had `handlePriceBlur` which accessed `prev` state. 
      // It's better to pass a dedicated `onBlur` prop or handle self-correction.
      // Let's implement self-correction logic here based on props.
      
      let val = field === 'priceMin' ? priceMin : priceMax;
      
      if (val < 20 && val !== 0) val = 20;

      if (field === 'priceMin' && val > priceMax) {
          val = priceMax;
      }
      if (field === 'priceMax' && val < priceMin) {
          val = priceMin;
      }
      
      // If value changed after validation, notify parent
      if (val !== (field === 'priceMin' ? priceMin : priceMax)) {
         onPriceChange(field, val);
      }
  };

  return (
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
              value={priceMin || ''}
              onChange={(e) => handleInputChange('priceMin', e.target.value)}
              onBlur={() => handleBlur('priceMin')}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
              placeholder="20"
              min="20"
              max="10000"
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
              value={priceMax || ''}
              onChange={(e) => handleInputChange('priceMax', e.target.value)}
              onBlur={() => handleBlur('priceMax')}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
              placeholder="10000+"
              min="20"
              max="10000"
            />
          </div>
        </div>
      </div>
    </FilterSection>
  );
};
