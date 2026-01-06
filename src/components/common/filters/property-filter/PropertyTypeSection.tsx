import React from 'react';
import { FilterSection } from './FilterSection';
import { usePropertiesTypes } from '@/hooks/property/use-properties-types';

interface PropertyTypeSectionProps {
  selectedType: string;
  onChange: (type: string) => void;
}

export const PropertyTypeSection = ({ selectedType, onChange }: PropertyTypeSectionProps) => {
  const { propertyTypes } = usePropertiesTypes();

  return (
    <FilterSection title="Property type">
      <div className="grid grid-cols-5 gap-3">
        {propertyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(selectedType === type.id ? '' : type.id)}
            className={`flex flex-col items-center justify-center gap-1 p-3 border rounded-lg transition-colors h-16 ${
              selectedType === type.id
                ? 'border-black bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            title={type.label}
          >
            <type.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium text-gray-900 text-center line-clamp-1 leading-tight text-ellipsis">{type.label}</span>
          </button>
        ))}
      </div>
    </FilterSection>
  );
};
