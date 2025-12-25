'use client';

import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PropertyPreview {
  id: string;
  title: string;
  city: string;
  coverPhoto?: string;
  pricePerNight: number;
  averageRating?: number;
  reviewCount: number;
}

interface ProfilePropertiesProps {
  properties: PropertyPreview[];
  hostName: string;
}

export default function ProfileProperties({ properties, hostName }: ProfilePropertiesProps) {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {hostName}&apos;s Listings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/property/${property.id}`}
            className="group block"
          >
            <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Property Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                {property.coverPhoto ? (
                  <img
                    src={property.coverPhoto}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <MapPin size={32} className="text-gray-400" />
                  </div>
                )}

                {/* Rating Badge */}
                {property.averageRating && property.averageRating > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {property.averageRating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                  {property.title}
                </h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {property.city}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">${property.pricePerNight}</span>
                    <span className="text-gray-500"> / night</span>
                  </p>
                  {property.reviewCount > 0 && (
                    <p className="text-xs text-gray-400">
                      {property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {properties.length >= 6 && (
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
            View all {properties.length}+ listings
          </button>
        </div>
      )}
    </div>
  );
}
