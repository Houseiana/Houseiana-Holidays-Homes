'use client';

import { Star, MapPin } from 'lucide-react';
import type { PropertyDetail } from '@/hooks';

export interface PropertyTitleSectionProps {
  property: PropertyDetail;
  ratingLabel: string;
}

export function PropertyTitleSection({ property, ratingLabel }: PropertyTitleSectionProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{property.title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-800 font-semibold">
          <Star className="w-4 h-4 fill-current text-amber-400" />
          <span className="text-sm">{ratingLabel}</span>
        </div>
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="w-4 h-4" /> {property.location}
        </span>
      </div>
    </div>
  );
}
