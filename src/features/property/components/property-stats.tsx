'use client';

import { Users, CheckCircle, Flag } from 'lucide-react';

export interface PropertyStatsProps {
  guests: number;
  bedrooms: number;
  bathrooms: number;
}

export function PropertyStats({ guests, bedrooms, bathrooms }: PropertyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
        <Users className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Up to</p>
          <p className="text-lg font-semibold text-gray-900">{guests} guests</p>
        </div>
      </div>
      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
        <CheckCircle className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Bedrooms</p>
          <p className="text-lg font-semibold text-gray-900">{bedrooms}</p>
        </div>
      </div>
      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
        <Flag className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Bathrooms</p>
          <p className="text-lg font-semibold text-gray-900">{bathrooms}</p>
        </div>
      </div>
    </div>
  );
}
