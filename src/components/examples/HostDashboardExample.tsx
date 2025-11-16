/**
 * Host Dashboard Example Component
 * Demonstrates: Using the OOP API (v2) for host dashboard
 *
 * This component shows how to:
 * - Fetch host dashboard data
 * - Display statistics and metrics
 * - Show property listings
 * - Handle booking management actions
 */
'use client';

import { useState, useEffect } from 'react';

interface HostDashboardData {
  user: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  properties: number;
  publishedProperties: number;
  totalBookings: number;
  pendingBookings: number;
  upcomingBookings: number;
  totalEarnings: number;
  averageRating: number;
}

interface Booking {
  id: string;
  guestName: string;
  propertyTitle: string;
  dateRange: { start: string; end: string };
  totalPrice: { amount: number; currency: string };
  status: string;
}

export function HostDashboardExample({ hostId }: { hostId: string }) {
  const [dashboardData, setDashboardData] = useState<HostDashboardData | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadPendingBookings();
  }, [hostId]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`/api/v2/users/${hostId}/dashboard?role=host`);
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingBookings = async () => {
    try {
      const response = await fetch(`/api/v2/bookings?userId=${hostId}&role=host`);
      const result = await response.json();

      if (result.success) {
        // Filter pending bookings (this would normally come from the API)
        setPendingBookings(result.data.filter((b: Booking) => b.status === 'PENDING'));
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          hostId,
          reason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reload data
        loadDashboardData();
        loadPendingBookings();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Failed to update booking');
      console.error('Error updating booking:', err);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {dashboardData.user.profile.firstName}!
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Total Properties</h3>
          <p className="text-3xl font-bold">{dashboardData.properties}</p>
          <p className="text-sm text-gray-500 mt-1">
            {dashboardData.publishedProperties} published
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold">{dashboardData.totalBookings}</p>
          <p className="text-sm text-gray-500 mt-1">
            {dashboardData.upcomingBookings} upcoming
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {dashboardData.pendingBookings}
          </p>
          <p className="text-sm text-gray-500 mt-1">Requires action</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold">QAR {dashboardData.totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>
      </div>

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Booking Requests</h2>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{booking.propertyTitle}</h3>
                  <p className="text-sm text-gray-600">
                    Guest: {booking.guestName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.dateRange.start} - {booking.dateRange.end}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {booking.totalPrice.currency} {booking.totalPrice.amount}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBookingAction(booking.id, 'confirm')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for declining:');
                      if (reason) {
                        handleBookingAction(booking.id, 'reject', reason);
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
            List New Property
          </button>
          <button className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
            View All Bookings
          </button>
          <button className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
            Manage Properties
          </button>
        </div>
      </div>
    </div>
  );
}
