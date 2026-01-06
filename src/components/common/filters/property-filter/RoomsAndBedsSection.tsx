import React from 'react';
import { FilterSection } from './FilterSection';
import { FilterCounter } from './FilterCounter';

interface RoomsAndBedsSectionProps {
  bedrooms: number;
  beds: number;
  bathrooms: number;
  onUpdate: (field: 'bedrooms' | 'beds' | 'bathrooms', value: number) => void;
}

export const RoomsAndBedsSection = ({
  bedrooms,
  beds,
  bathrooms,
  onUpdate
}: RoomsAndBedsSectionProps) => {
  return (
    <FilterSection title="Rooms and beds">
      <div className="space-y-4">
        <FilterCounter
          label="Bedrooms"
          value={bedrooms}
          onChange={(value) => onUpdate('bedrooms', value)}
          max={10}
        />
        <FilterCounter
          label="Beds"
          value={beds}
          onChange={(value) => onUpdate('beds', value)}
          max={20}
        />
        <FilterCounter
          label="Bathrooms"
          value={bathrooms}
          onChange={(value) => onUpdate('bathrooms', value)}
          max={5}
        />
      </div>
    </FilterSection>
  );
};
