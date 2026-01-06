'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bath, Bed, Heart, Star, Users } from 'lucide-react';
import { PropertySummary } from '@/types/property';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import BackendAPI from '@/lib/api/backend-api';
import Swal from 'sweetalert2';

interface PropertyCardProps {
  property: PropertySummary;
  index?: number; // For priority loading of images
  onToggle?: (id: string) => void;
}

export default function PropertyCard({ property, index = 0, onToggle }: PropertyCardProps) {
  const { userId } = useAuth();
  const [isFavorite, setIsFavorite] = useState(property?.isFavorite);
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

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) {
        Swal.fire({
            icon: 'error',
            title: 'You must be logged in to favorite a property',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        })
        return
    };

    // Optimistic update
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    try {
      await BackendAPI.User.toggleFavorite(userId, property.id);
      if (onToggle) {
        onToggle(property.id);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to toggle favorite',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
      // Revert on error
      setIsFavorite(!newStatus);
    }
  };

  const isNewProperty = (property: PropertySummary) => {
    if (!property.createdAt) return false;
    const createdDate = new Date(property.createdAt);
    const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated < 30;
  };

  useEffect(() => {
    setIsFavorite(property.isFavorite);
  }, [property]);

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group cursor-pointer bg-white shadow-lg hover:shadow-lg hover:shadow-gray-200 rounded-2xl overflow-hidden duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-gray-200">
          <Image
            src={getPropertyImage(property) || '/placeholder-property.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 "
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={index < 4}
          />
          <div className="absolute top-2 right-2">
            <button
                onClick={handleFavoriteClick}
                className="p-2 hover:scale-110 transition-transform"
            >
                <Heart 
                className={`w-6 h-6 drop-shadow-lg transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-white hover:fill-white/50'
                }`} 
                />
            </button>
            {(property.weeklyDiscount || 0) > 0 || (property.smallBookingDiscount || 0) > 0 ? (
                <div className="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                -{property.weeklyDiscount || property.smallBookingDiscount}%
                </div>
            ) : null}
          </div>
          {/* Badge Logic - showing Guest favorite for new properties as per original code */}
          {isNewProperty(property) && (
            <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              <span>🏆</span> Guest favorite
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="space-y-1 p-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900">{property.city} - {property.country}</h3>
            {property.averageRating !== undefined && property.averageRating > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span className="text-sm">{property.averageRating.toFixed(2)}</span>
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm line-clamp-1">{property.title}</p>
          {/* Property Details */}
          {((property.bedrooms || 0) > 0 || (property.bathrooms || 0) > 0 || (property.guestCount || 0) > 0) && (
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              {(property.guestCount || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{property.guestCount}</span>
                </div>
              )}
              {(property.bedrooms || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {(property.bathrooms || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
            </div>
          )}
          <p className="text-gray-900 pt-1">
            {((property.weeklyDiscount || 0) > 0 || (property.smallBookingDiscount || 0) > 0) && property.priceWithoutDiscount ? (
              <>
                 <span className="text-gray-400 line-through text-sm mr-2">${property.priceWithoutDiscount}</span>
                 <span className="font-semibold text-rose-500">${property.pricePerNight}</span>
                 <span className="text-gray-500"> per night</span>
              </>
            ) : (
              <>
                <span className="font-semibold">${property.pricePerNight}</span>
                <span className="text-gray-500"> per night</span>
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
