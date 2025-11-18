/**
 * My Trips Page
 * View and manage bookings as a guest
 * Uses existing Booking API (v2)
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Users, DollarSign, MessageCircle,
  Eye, XCircle, Trash2, Plane, CheckCircle, Clock, Ban
} from 'lucide-react';

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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
        <p className="text-sm text-gray-500">View and manage all your bookings</p>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-1">
          {(['upcoming', 'current', 'past'] as const).map((tab) => {
            const icons = {
              upcoming: <Calendar className="w-4 h-4" />,
              current: <Plane className="w-4 h-4" />,
              past: <CheckCircle className="w-4 h-4" />
            };

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex items-center gap-2 pb-4 px-4 border-b-2 font-semibold text-sm transition-all
                  ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {icons[tab]}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {totalTrips[tab]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Empty State */}
      {currentTrips.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
            {activeTab === 'upcoming' && <Calendar className="w-10 h-10 text-gray-400" />}
            {activeTab === 'current' && <Plane className="w-10 h-10 text-gray-400" />}
            {activeTab === 'past' && <CheckCircle className="w-10 h-10 text-gray-400" />}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {activeTab} trips
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            {activeTab === 'upcoming' && "You don't have any upcoming trips yet. Start planning your next adventure!"}
            {activeTab === 'current' && "You don't have any current trips. Your active bookings will appear here."}
            {activeTab === 'past' && "You haven't completed any trips yet. Your travel history will show here."}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => (window.location.href = '/explore')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              Explore Properties
            </button>
          )}
        </div>
      )}

      {/* Enhanced Trips List */}
      <div className="space-y-5">
        {currentTrips.map((booking) => {
          const statusConfig = {
            CONFIRMED: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Confirmed' },
            PENDING: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
            CANCELLED: { color: 'bg-red-50 text-red-700 border-red-200', icon: Ban, label: 'Cancelled' },
            REJECTED: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle, label: 'Rejected' }
          };

          const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.PENDING;
          const StatusIcon = status.icon;

          return (
            <div
              key={booking.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="w-full md:w-64 h-52 md:h-auto bg-gray-200 flex-shrink-0 relative overflow-hidden">
                  {booking.propertyImage ? (
                    <img
                      src={booking.propertyImage}
                      alt={booking.propertyTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-6xl">🏠</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-sm bg-white/90 ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.propertyTitle}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        Hosted by <span className="font-semibold text-gray-700">{booking.hostName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 bg-gray-50 rounded-xl p-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <p className="text-xs font-semibold">Check-in</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(booking.dateRange.start).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <p className="text-xs font-semibold">Check-out</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(booking.dateRange.end).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Users className="w-3.5 h-3.5" />
                        <p className="text-xs font-semibold">Guests</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{booking.guestCount}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <p className="text-xs font-semibold">Total</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {booking.totalPrice.currency} {booking.totalPrice.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action-Oriented Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {activeTab === 'upcoming' && booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Trip
                      </button>
                    )}
                    {(booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Message Host
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
