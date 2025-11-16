'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, MapPin, Users, Bed, Bath } from 'lucide-react';

export interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    city?: string;
    country?: string;
    location?: string; // fallback for combined location
    photos?: string[];
    image?: string; // fallback for single image
    pricePerNight?: number;
    price?: number; // fallback naming
    averageRating?: number;
    rating?: number; // fallback naming
    reviewCount?: number;
    bedrooms?: number;
    beds?: number; // fallback naming
    bathrooms?: number;
    baths?: number; // fallback naming
    guests?: number;
    sleeps?: number; // fallback naming
    distance?: string;
    host?: {
      firstName: string;
      lastName: string;
    };
    oldPrice?: number;
    discountPercent?: number;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  layout?: 'grid' | 'list';
  showViewButton?: boolean;
}

export function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  layout = 'grid',
  showViewButton = true
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Normalize property data (handle different field names)
  const price = property.pricePerNight || property.price || 0;
  const rating = property.averageRating || property.rating;
  const bedrooms = property.bedrooms || property.beds || 0;
  const bathrooms = property.bathrooms || property.baths || 0;
  const guestCount = property.guests || property.sleeps || 0;
  const location = property.city && property.country
    ? `${property.city}, ${property.country}`
    : property.location || 'Location not specified';

  // Handle images array or single image
  const images = property.photos && property.photos.length > 0
    ? property.photos
    : property.image
    ? [property.image]
    : [];

  const currentImage = images[currentImageIndex] || '/placeholder-property.jpg';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(property.id);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${
          layout === 'list' ? 'flex' : ''
        }`}
      >
        {/* Image Section with Carousel */}
        <div className={`relative ${layout === 'list' ? 'w-64 h-48 flex-shrink-0' : 'h-64'}`}>
          <div className="relative w-full h-full overflow-hidden bg-gray-200">
            {imageError ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            ) : (
              <Image
                src={currentImage}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          {/* Image Navigation Arrows (only show on hover if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100 shadow-md z-10"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100 shadow-md z-10"
                aria-label="Next image"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Discount Badge */}
          {property.discountPercent && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-md text-sm font-semibold shadow-md">
              -{property.discountPercent}% OFF
            </div>
          )}

          {/* Floating Wishlist Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 shadow-md z-10"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1">
          {/* Location & Rating (Top Line) */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{location}</h3>
            </div>
            {rating && rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                {property.reviewCount && (
                  <span className="text-sm text-gray-500">({property.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Subtitle (Distance or Host) */}
          {(property.distance || property.host) && (
            <p className="text-sm text-gray-600 mb-1">
              {property.distance || `Hosted by ${property.host?.firstName} ${property.host?.lastName || ''}`}
            </p>
          )}

          {/* Title */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{property.title}</p>

          {/* Property Details */}
          {(bedrooms > 0 || bathrooms > 0 || guestCount > 0) && (
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              {guestCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{guestCount}</span>
                </div>
              )}
              {bedrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{bedrooms}</span>
                </div>
              )}
              {bathrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{bathrooms}</span>
                </div>
              )}
            </div>
          )}

          {/* Price (Bottom Line) */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {property.oldPrice && (
                <span className="text-sm text-gray-400 line-through">${property.oldPrice}</span>
              )}
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-gray-900">${price}</span>
                <span className="text-sm text-gray-600 ml-1">/ night</span>
              </div>
            </div>
            {showViewButton && (
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                View
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;
