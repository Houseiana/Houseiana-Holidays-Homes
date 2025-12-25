'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const GoogleMapsView = dynamic(() => import('@/components/map/GoogleMapsView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export interface LocationSectionProps {
  location: string;
  latitude?: number;
  longitude?: number;
  title: string;
}

export function LocationSection({ location, latitude, longitude, title }: LocationSectionProps) {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Where you&apos;ll be</h2>
      </div>
      <p className="text-sm text-gray-700">{location}</p>
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64">
        {latitude && longitude ? (
          <GoogleMapsView
            latitude={latitude}
            longitude={longitude}
            title={title}
            zoom={15}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-600">Map not available</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600">Exact location shown on map. Pin placed by host during listing.</p>
    </div>
  );
}
