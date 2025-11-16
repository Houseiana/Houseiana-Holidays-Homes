/**
 * Wishlist Page
 * Manage favorite properties
 * Uses Favorite API (v2)
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  title: string;
  description: string;
  pricePerNight: { amount: number; currency: string };
  images: string[];
  address: { city: string; country: string };
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
}

interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  notes?: string;
  createdAt: string;
}

interface WishlistItem {
  favorite: Favorite;
  property: Property | null;
}

export default function WishlistPage() {
  const { user, isLoaded } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadWishlist();
    }
  }, [isLoaded, user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v2/favorites?userId=${user?.id}`);
      const result = await response.json();

      if (result.success) {
        setWishlist(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load wishlist');
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (favoriteId: string, propertyTitle: string) => {
    if (!confirm(`Remove "${propertyTitle}" from your wishlist?`)) return;

    try {
      const response = await fetch(`/api/v2/favorites/${favoriteId}?userId=${user?.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setWishlist(prev => prev.filter(item => item.favorite.id !== favoriteId));
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Failed to remove from wishlist');
      console.error('Error removing from wishlist:', err);
    }
  };

  const handleUpdateNotes = async (favoriteId: string) => {
    const currentNotes = wishlist.find(item => item.favorite.id === favoriteId)?.favorite.notes || '';
    const newNotes = prompt('Update notes:', currentNotes);

    if (newNotes === null) return; // User cancelled

    try {
      const response = await fetch(`/api/v2/favorites/${favoriteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          notes: newNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setWishlist(prev =>
          prev.map(item =>
            item.favorite.id === favoriteId
              ? { ...item, favorite: result.data }
              : item
          )
        );
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Failed to update notes');
      console.error('Error updating notes:', err);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadWishlist}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-600">
          {wishlist.length} {wishlist.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {/* Empty State */}
      {wishlist.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding your favorite properties to plan your future trips!
          </p>
          <button
            onClick={() => (window.location.href = '/explore')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Properties
          </button>
        </div>
      )}

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const property = item.property;
          if (!property) return null;

          return (
            <div
              key={item.favorite.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">🏠</span>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.favorite.id, property.title)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {property.address.city}, {property.address.country}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{property.maxGuests} guests</span>
                  <span>•</span>
                  <span>{property.bedrooms} bed</span>
                  <span>•</span>
                  <span>{property.bathrooms} bath</span>
                </div>

                <div className="mb-3">
                  <p className="text-lg font-bold text-gray-900">
                    {property.pricePerNight.currency} {property.pricePerNight.amount}
                    <span className="text-sm font-normal text-gray-600"> / night</span>
                  </p>
                </div>

                {/* Notes */}
                {item.favorite.notes && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-gray-700 italic">"{item.favorite.notes}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => (window.location.href = `/properties/${property.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Property
                  </button>
                  <button
                    onClick={() => handleUpdateNotes(item.favorite.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    title="Add/Edit notes"
                  >
                    📝
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Added {new Date(item.favorite.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
