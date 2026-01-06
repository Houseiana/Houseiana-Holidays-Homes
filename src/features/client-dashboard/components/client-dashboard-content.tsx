'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Heart,
  MapPin,
  Search,
  Star,
  Clock,
  CheckCircle,
  Home,
  MessageCircle,
  Eye,
  XCircle
} from 'lucide-react';
import { BookingCardSkeleton } from '@/components/ui/loading-skeleton';
import { NoTripsEmptyState, NoFavoritesEmptyState, PastTripsEmptyState } from '@/components/ui/empty-state';

interface Booking {
  id: string;
  property: {
    id: string;
    title: string;
    coverPhoto?: string;
    photos: any;
    city: string;
    country: string;
    pricePerNight: number;
    host: {
      id: string;
      firstName: string;
      lastName: string;
      profilePhoto?: string;
    };
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface FavoriteProperty {
  id: string;
  property: {
    id: string;
    title: string;
    coverPhoto?: string;
    photos: any;
    city: string;
    country: string;
    pricePerNight: number;
    averageRating?: number;
  };
  createdAt: string;
}

export default function ClientDashboardContent() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    savedProperties: 0,
    averageRating: 4.8
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings?type=guest', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const upcoming = bookingsData.upcoming || [];
        const past = bookingsData.past || [];

        setUpcomingBookings(upcoming.slice(0, 4)); // Show max 4
        setPastBookings(past.slice(0, 4));
        setStats(prev => ({
          ...prev,
          totalTrips: upcoming.length + past.length
        }));
      }

      // Fetch favorites
      const favoritesResponse = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavorites((favoritesData.favorites || []).slice(0, 6));
        setStats(prev => ({
          ...prev,
          savedProperties: favoritesData.favorites?.length || 0
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPhotoUrl = (property: any) => {
    if (property.coverPhoto) return property.coverPhoto;
    if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
      return property.photos[0];
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
    };

    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.id !== favoriteId));
        setStats(prev => ({ ...prev, savedProperties: prev.savedProperties - 1 }));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        {/* Loading skeletons */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Plan your next adventure or manage your bookings</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/discover"
            className="flex items-center p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Search className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-primary-900">Find Properties</h3>
              <p className="text-sm text-primary-600">Discover amazing places to stay</p>
            </div>
          </Link>

          <button className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-green-900">Manage Trips</h3>
              <p className="text-sm text-green-600">View your bookings</p>
            </div>
          </button>

          <Link
            href="/saved-properties"
            className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Heart className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-purple-900">Saved Places</h3>
              <p className="text-sm text-purple-600">Your wishlist ({stats.savedProperties})</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Upcoming Trips</h3>
          <Link href="/my-trips" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View all
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((booking) => {
              const photoUrl = getPhotoUrl(booking.property);

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{booking.property.title}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.property.city}, {booking.property.country}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Check-in:</span> {formatDate(booking.checkIn)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Check-out:</span> {formatDate(booking.checkOut)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Guests:</span> {booking.guests}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        Total: ${booking.totalPrice}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/booking/${booking.id}`}
                        className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View Details
                      </Link>
                      <Link
                        href={`/messages/${booking.property.host.id}`}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 inline" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoTripsEmptyState />
        )}
      </div>

      {/* Past Trips & Saved Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Past Trips */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Past Trips</h3>
            <Link href="/my-trips?tab=past" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => {
                const photoUrl = getPhotoUrl(booking.property);

                return (
                  <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={booking.property.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Home className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{booking.property.title}</h4>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          {booking.property.city}, {booking.property.country}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Link
                          href={`/property/${booking.property.id}/review`}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Write Review
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <PastTripsEmptyState />
            )}
          </div>
        </div>

        {/* Saved Properties */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Saved Properties</h3>
            <Link href="/saved-properties" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {favorites.length > 0 ? (
              favorites.map((favorite) => {
                const photoUrl = getPhotoUrl(favorite.property);

                return (
                  <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={favorite.property.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Home className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{favorite.property.title}</h4>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          {favorite.property.city}, {favorite.property.country}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-medium text-gray-900">
                            ${favorite.property.pricePerNight}/night
                          </span>
                          {favorite.property.averageRating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {favorite.property.averageRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="text-red-500 hover:text-red-600 flex-shrink-0"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <NoFavoritesEmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-3" />
          <h4 className="text-2xl font-bold text-gray-900">{stats.totalTrips}</h4>
          <p className="text-sm text-gray-600">Total Trips</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h4 className="text-2xl font-bold text-gray-900">{stats.savedProperties}</h4>
          <p className="text-sm text-gray-600">Saved Properties</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h4 className="text-2xl font-bold text-gray-900">{stats.averageRating}</h4>
          <p className="text-sm text-gray-600">Average Rating Given</p>
        </div>
      </div>
    </div>
  );
}
