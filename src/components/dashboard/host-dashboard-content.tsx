'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  MessageCircle,
  Plus,
  Star,
  Users,
  Edit,
  Trash2,
  Eye,
  Send,
  XCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Bed,
  Bath
} from 'lucide-react';
import { DashboardStatSkeleton, TableRowSkeleton } from '@/components/ui/loading-skeleton';
import { NoPropertiesEmptyState } from '@/components/ui/empty-state';

interface Property {
  id: string;
  title: string;
  coverPhoto?: string;
  photos: any;
  city: string;
  country: string;
  state?: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'UNLISTED' | 'SUSPENDED';
  isActive: boolean;
  viewCount: number;
  bookingCount: number;
  averageRating?: number;
  createdAt: string;
  submittedForReviewAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  _count?: {
    bookings: number;
    reviews: number;
    favorites: number;
  };
}

interface Booking {
  id: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    email: string;
  };
  property: {
    id: string;
    title: string;
    coverPhoto?: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function HostDashboardContentEnhanced() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; propertyId: string | null }>({
    show: false,
    propertyId: null,
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    revenue: 0,
    occupancyRate: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchHostData();
  }, []);

  const fetchHostData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');

      if (!token || !userData) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);

      // Fetch host's properties
      const propertiesResponse = await fetch(`/api/properties?hostId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      }

      // Fetch host's bookings
      const bookingsResponse = await fetch('/api/bookings?type=host', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const allBookings = bookingsData.bookings || [];
        setBookings(allBookings.slice(0, 5)); // Show latest 5

        // Calculate stats
        const totalBookings = allBookings.length;
        const revenue = allBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
        const confirmedBookings = allBookings.filter((b: any) => b.status === 'CONFIRMED').length;
        const occupancyRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

        setStats({
          totalBookings,
          revenue,
          occupancyRate: Math.round(occupancyRate),
          averageRating: 0, // TODO: Calculate from reviews
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching host data:', error);
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!deleteModal.propertyId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/properties?id=${deleteModal.propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== deleteModal.propertyId));
        setDeleteModal({ show: false, propertyId: null });
        alert('Property deleted successfully');
      } else {
        alert('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  const handleSubmitForReview = async (propertyId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: propertyId,
          status: 'PENDING_REVIEW',
          submittedForReviewAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        fetchHostData(); // Refresh data
        alert('Property submitted for review!');
      } else {
        alert('Failed to submit property');
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Error submitting property');
    }
  };

  const handleToggleActive = async (propertyId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: propertyId,
          isActive: !currentStatus,
          status: !currentStatus ? 'PUBLISHED' : 'UNLISTED',
        }),
      });

      if (response.ok) {
        fetchHostData(); // Refresh data
      }
    } catch (error) {
      console.error('Error toggling property status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      PENDING_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      PUBLISHED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      UNLISTED: { bg: 'bg-orange-100', text: 'text-orange-800', icon: XCircle },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    };

    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPhotoUrl = (property: any) => {
    if (property.coverPhoto) return property.coverPhoto;
    if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
      return property.photos[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        {/* Stats Loading */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </div>
        </div>

        {/* Properties Table Loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <TableRowSkeleton />
                <TableRowSkeleton />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Quick Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="text-blue-600">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              </div>
              <div className="text-green-600">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
              <div className="text-yellow-600">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="text-purple-600">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/host-dashboard/add-listing"
            className="inline-flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Property
          </Link>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </button>
          <Link
            href="/messages-inbox"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </Link>
        </div>
      </div>

      {/* Property Management Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">My Properties ({properties.length})</h3>
            <Link
              href="/host-dashboard/add-listing"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              + Add Property
            </Link>
          </div>
        </div>

        {properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => {
                  const photoUrl = getPhotoUrl(property);

                  return (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                            {photoUrl ? (
                              <Image
                                src={photoUrl}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Home className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4 max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {property.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {property._count && `${property._count.favorites} favorites`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {property.city}, {property.country}
                        </div>
                        {property.state && (
                          <div className="text-xs text-gray-500">{property.state}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {property.guests} guests
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Bed className="w-3 h-3 mr-1" />
                            {property.bedrooms} bed · <Bath className="w-3 h-3 ml-1 mr-1" /> {property.bathrooms} bath
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${property.pricePerNight}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {getStatusBadge(property.status)}
                          {property.rejectionReason && (
                            <div className="text-xs text-red-600 max-w-xs">
                              Rejected: {property.rejectionReason}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1 text-gray-400" />
                            {property.viewCount} views
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {property._count?.bookings || 0} bookings
                          </div>
                          {property.averageRating && property.averageRating > 0 && (
                            <div className="flex items-center text-xs">
                              <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                              {property.averageRating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/property/${property.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/host-dashboard/edit-listing/${property.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {property.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSubmitForReview(property.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Submit for Review"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {property.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleToggleActive(property.id, property.isActive)}
                              className={`${
                                property.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={property.isActive ? 'Unlist' : 'Publish'}
                            >
                              {property.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteModal({ show: true, propertyId: property.id })}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <NoPropertiesEmptyState />
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="p-6">
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{booking.property.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">${booking.totalPrice}</p>
                      {getBookingStatusBadge(booking.status)}
                    </div>
                    <Link
                      href={`/messages/${booking.guest.id}`}
                      className="text-accent-600 hover:text-accent-700"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p>No bookings yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Property?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, propertyId: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProperty}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
