import React from 'react';
import { 
  Edit, Star, Eye, Calendar,
  Image as ImageIcon, Zap 
} from 'lucide-react';
import { Listing } from '@/hooks';
import { statusConfig } from './constants';

// Helper function to format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface ListingRowProps {
  listing: Listing;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onViewCalendar: () => void;
}

export function ListingRow({ listing, isSelected, onToggleSelect, onView, onEdit, onViewCalendar }: ListingRowProps) {
  const status = statusConfig[listing.status];

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 text-teal-600 rounded"
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {listing.images.length > 0 ? (
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">{listing.title}</p>
            <p className="text-sm text-gray-500">{listing.location}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-4">
        {listing.instantBook ? (
          <span className="flex items-center gap-1 text-teal-600">
            <Zap className="w-4 h-4" />
            On
          </span>
        ) : (
          <span className="text-gray-400">Off</span>
        )}
      </td>
      <td className="px-4 py-4">
        <span className="font-medium text-gray-900">QAR {listing.basePrice}</span>
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-gray-900">{listing.bookings.upcoming} upcoming</p>
          <p className="text-sm text-gray-500">{listing.bookings.total} total</p>
        </div>
      </td>
      <td className="px-4 py-4">
        {listing.rating ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{listing.rating}</span>
            <span className="text-gray-500">({listing.reviewCount})</span>
          </div>
        ) : (
          <span className="text-gray-400">No reviews</span>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(listing.lastUpdated)}</td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onView} className="p-2 hover:bg-gray-100 rounded-lg" title="Preview">
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={onViewCalendar} className="p-2 hover:bg-gray-100 rounded-lg" title="Calendar">
            <Calendar className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </td>
    </tr>
  );
}
