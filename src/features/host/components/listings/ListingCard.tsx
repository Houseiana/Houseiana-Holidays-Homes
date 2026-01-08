import React from 'react';
import { 
  Building2, Edit, Star, Eye, MoreHorizontal,
  MapPin, Bed, Bath, Image as ImageIcon,
  Users, Trash, Ban, AlertCircle, Camera 
} from 'lucide-react';
import { Listing } from '@/hooks';
import { statusConfig } from './constants';

export interface ListingCardProps {
  listing: Listing;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onViewCalendar: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onBlock: () => void;
}

export function ListingCard({ listing, isSelected, onToggleSelect, onView, onEdit, onViewCalendar, onDelete, onToggleStatus, onBlock }: ListingCardProps) {
  const status = statusConfig[listing.status];
  const isActive = listing.status === 'active';

  return (
    <div 
      onClick={onToggleSelect}
      className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${
        isSelected ? 'border-teal-600 ring-2 ring-teal-600' : 'border-gray-200'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-200">
        {listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-32 h-32 text-gray-400" />
          </div>
        )}

        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </div>

        <div className={`absolute top-2 right-2 px-1 py-1 rounded-full text-xs font-medium z-10`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-red-100 rounded-full shadow hover:bg-red-200 flex items-center justify-center p-1.5 transition-colors"
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>

        <div className="absolute top-3 right-12 flex gap-2">
          {listing.guestFavorite && (
            <div className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-900 shadow">
              Guest favorite
            </div>
          )}
          {listing.superhostBadge && (
            <div className="px-2 py-1 bg-white rounded-full shadow">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }} 
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 flex items-center justify-center"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 flex items-center justify-center"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onViewCalendar(); }} 
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 flex items-center justify-center"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {listing.imageCount}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {listing.location}
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {listing.bedrooms || 'Studio'}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {listing.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {listing.maxGuests}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {listing.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{listing.rating}</span>
                <span className="text-sm text-gray-500">({listing.reviewCount})</span>
              </div>
            )}
            {listing.status === 'draft' && listing.completionPercent && (
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${listing.completionPercent}%` }} />
                </div>
                <span className="text-xs text-gray-500">{listing.completionPercent}%</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">QAR {listing.basePrice}</p>
            <p className="text-xs text-gray-500">per night</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Eye className="w-4 h-4" />
            {listing.views.toLocaleString()} views
          </div>
          {listing.bookings.upcoming > 0 && (
            <span className="text-teal-600 font-medium">{listing.bookings.upcoming} upcoming</span>
          )}
        </div>

        {(listing.pauseReason || listing.deactivationReason) && (
          <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{listing.pauseReason || listing.deactivationReason}</p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <label 
          className="flex items-center gap-2 cursor-pointer group/toggle"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isActive}
              onChange={() => onToggleStatus()}
            />
            <div className={`
              w-9 h-5 rounded-full transition-colors duration-200 ease-in-out
              ${isActive ? 'bg-teal-600' : 'bg-gray-300'}
              peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500/20
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:border-gray-300 after:border after:rounded-full 
              after:h-4 after:w-4 after:transition-all duration-200
              peer-checked:after:translate-x-4 peer-checked:after:border-white
            `}></div>
          </div>
          <span className={`text-sm font-medium transition-colors ${isActive ? 'text-teal-700' : 'text-gray-500'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </label>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBlock();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-white hover:shadow-sm hover:text-rose-600 transition-all border border-transparent hover:border-gray-200"
          title="Block listing"
        >
          <Ban className="w-3.5 h-3.5" />
          Block
        </button>
      </div>
    </div>
  );
}
