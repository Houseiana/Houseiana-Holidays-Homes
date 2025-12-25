'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { PropertySummary } from '@/types/property';

interface PropertyCardProps {
  property: PropertySummary;
  index?: number; // For priority loading of images
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const getPropertyImage = (property: PropertySummary) => {
    if (property.coverPhoto) return property.coverPhoto;
    if (property.photos) {
      try {
        const photos = typeof property.photos === 'string' ? JSON.parse(property.photos) : property.photos;
        if (Array.isArray(photos) && photos.length > 0) return photos[0];
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop';
  };

  const isNewProperty = (property: PropertySummary) => {
    if (!property.createdAt) return false;
    const createdDate = new Date(property.createdAt);
    const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated < 30;
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-200">
          <Image
            src={getPropertyImage(property) || '/placeholder-property.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={index < 4}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              // Handle wishlist toggle
            }}
            className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
          >
            <Heart className="w-6 h-6 text-white drop-shadow-lg hover:fill-white/50" />
          </button>
          
          {/* Badge Logic - showing Guest favorite for new properties as per original code */}
          {isNewProperty(property) && (
            <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              <span>🏆</span> Guest favorite
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900">{property.city}, {property.country}</h3>
            {property.averageRating !== undefined && property.averageRating > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">{property.averageRating.toFixed(2)}</span>
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm">{property.title}</p>
          <p className="text-gray-500 text-sm">Available now</p>
          <p className="text-gray-900 pt-1">
            <span className="font-semibold">${property.pricePerNight}</span>
            <span className="text-gray-500"> night</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
