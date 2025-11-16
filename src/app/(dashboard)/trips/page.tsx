/**
 * My Trips Page
 * View and manage bookings as a guest
 * Uses existing Booking API (v2)
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface Booking {
  id: string;
  propertyTitle: string;
  propertyImage: string;
  hostName: string;
  dateRange: { start: string; end: string };
  totalPrice: { amount: number; currency: string };
  guestCount: number;
  status: string;
  createdAt: string;
}

interface TripsData {
  upcoming: Booking[];
  current: Booking[];
  past: Booking[];
}

export default function TripsPage() {
  const { user, isLoaded } = useUser();
  const [tripsData, setTripsData] = useState<TripsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'current' | 'past'>('upcoming');

  useEffect(() => {
    if (isLoaded && user) {
      loadTrips();
    }
  }, [isLoaded, user]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v2/bookings?userId=${user?.id}&role=guest`);
      const result = await response.json();

      if (result.success) {
        setTripsData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load trips');
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          userId: user?.id,
          reason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Booking cancelled successfully');
        loadTrips(); // Reload trips
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Booking deleted successfully');
        loadTrips(); // Reload trips
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Failed to delete booking');
      console.error('Error deleting booking:', err);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadTrips}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentTrips = tripsData?.[activeTab] || [];
  const totalTrips = {
    upcoming: tripsData?.upcoming.length || 0,
    current: tripsData?.current.length || 0,
    past: tripsData?.past.length || 0,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Trips</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['upcoming', 'current', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({totalTrips[tab]})
            </button>
          ))}
        </nav>
      </div>

      {/* Empty State */}
      {currentTrips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {activeTab} trips
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' && "You don't have any upcoming trips yet."}
            {activeTab === 'current' && "You don't have any current trips."}
            {activeTab === 'past' && "You haven't completed any trips yet."}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => (window.location.href = '/explore')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Properties
            </button>
          )}
        </div>
      )}

      {/* Trips List */}
      <div className="space-y-4">
        {currentTrips.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Property Image */}
              <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                {booking.propertyImage ? (
                  <img
                    src={booking.propertyImage}
                    alt={booking.propertyTitle}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🏠</span>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.propertyTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Host: {booking.hostName}
                    </p>
                  </div>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                      ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-medium">
                      {new Date(booking.dateRange.start).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-medium">
                      {new Date(booking.dateRange.end).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-medium">{booking.guestCount} guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-medium">
                      {booking.totalPrice.currency} {booking.totalPrice.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  {activeTab === 'upcoming' && booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {(booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete Booking
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Message Host
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
