'use client';

import { Wifi, Car, Coffee, Tv } from 'lucide-react';

export interface AmenitiesSectionProps {
  amenities: string[];
}

function getAmenityIcon(amenity: string) {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="w-6 h-6" />;
    case 'parking':
      return <Car className="w-6 h-6" />;
    case 'kitchen':
      return <Coffee className="w-6 h-6" />;
    case 'tv':
      return <Tv className="w-6 h-6" />;
    default:
      return <Wifi className="w-6 h-6" />;
  }
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {amenities?.map((amenity) => (
          <div key={amenity} className="flex items-center gap-3 text-gray-800">
            {getAmenityIcon(amenity)}
            <span className="font-medium capitalize">{amenity}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50">
        Show all amenities
      </button>
    </div>
  );
}
