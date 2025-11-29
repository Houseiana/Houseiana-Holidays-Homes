'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  CheckCircle,
  XCircle,
  Clock,
  Home,
  MapPin,
  Users,
  Bed,
  Bath,
  DollarSign,
  Calendar,
  Star,
  Shield,
  Eye,
  Send,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Filter,
  Search,
  ChevronDown,
  ImageIcon,
  ZoomIn
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  coverPhoto?: string;
  photos: any;
  propertyType: string;
  roomType: string;
  city: string;
  country: string;
  state?: string;
  address: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number;
  cleaningFee?: number;
  serviceFee?: number;
  amenities: any;
  status: string;
  submittedForReviewAt?: string;
  createdAt: string;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    kycCompleted: boolean;
    memberSince: string;
  };
  _count?: {
    bookings: number;
    reviews: number;
    favorites: number;
  };
}

export default function AdminReviewDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    show: boolean;
    action: 'approve' | 'reject' | null;
  }>({ show: false, action: null });
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [filterStatus, setFilterStatus] = useState('PENDING_REVIEW');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<Array<{ src: string }>>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (filterStatus) {
      fetchProperties();
    }
  }, [filterStatus]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');

      if (!token || !userData) {
        router.push('/?auth=signin');
        return;
      }

      const user = JSON.parse(userData);
      if (!user.isAdmin) {
        router.push('/unauthorized');
        return;
      }

      fetchProperties();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/');
    }
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/properties?status=${filterStatus}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);

        // Update stats
        setStats({
          pending: data.properties?.filter((p: Property) => p.status === 'PENDING_REVIEW').length || 0,
          approved: data.properties?.filter((p: Property) => p.status === 'PUBLISHED').length || 0,
          rejected: data.properties?.filter((p: Property) => p.status === 'DRAFT').length || 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedProperty || !reviewModal.action) return;

    if (reviewModal.action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          action: reviewModal.action,
          reviewNotes: reviewNotes.trim() || null,
          rejectionReason: reviewModal.action === 'reject' ? rejectionReason.trim() : null,
        }),
      });

      if (response.ok) {
        alert(`Property ${reviewModal.action}d successfully!`);
        setReviewModal({ show: false, action: null });
        setSelectedProperty(null);
        setReviewNotes('');
        setRejectionReason('');
        fetchProperties();
      } else {
        const error = await response.json();
        alert(`Failed to ${reviewModal.action} property: ${error.error}`);
      }
    } catch (error) {
      console.error('Error reviewing property:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getPhotosArray = (property: Property): string[] => {
    try {
      if (Array.isArray(property.photos)) {
        return property.photos;
      }
      if (typeof property.photos === 'string') {
        const parsed = JSON.parse(property.photos);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const openLightbox = (photos: string[], index: number) => {
    setLightboxImages(photos.map(src => ({ src })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAmenityList = (amenities: any) => {
    if (Array.isArray(amenities)) return amenities;
    try {
      if (typeof amenities === 'string') {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Shield className="w-6 h-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Admin Property Review</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin Panel</span>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Approved</option>
                <option value="DRAFT">Rejected</option>
                <option value="">All Properties</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {properties.length} properties
            </div>
          </div>
        </div>

        {/* Properties List */}
        {properties.length > 0 ? (
          <div className="space-y-6">
            {properties.map((property) => {
              const photos = getPhotosArray(property);
              const amenities = getAmenityList(property.amenities);

              return (
                <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {property.city}, {property.country}
                            {property.state && ` · ${property.state}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {property.address}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          property.status === 'PENDING_REVIEW'
                            ? 'bg-yellow-100 text-yellow-800'
                            : property.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Photo Gallery */}
                      {photos.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-gray-600" />
                            <p className="text-sm font-medium text-gray-700">Property Photos ({photos.length})</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {photos.slice(0, 10).map((photo, index) => (
                              <div
                                key={index}
                                className="relative h-32 bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => openLightbox(photos, index)}
                              >
                                <Image
                                  src={photo}
                                  alt={`${property.title} - Photo ${index + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                            ))}
                            {photos.length > 10 && (
                              <div
                                className="relative h-32 bg-gray-800 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center"
                                onClick={() => openLightbox(photos, 10)}
                              >
                                <p className="text-white text-lg font-semibold">+{photos.length - 10}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Property Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {property.guests} guests
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Bed className="w-4 h-4 mr-2 text-gray-400" />
                          {property.bedrooms} bedrooms
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Bath className="w-4 h-4 mr-2 text-gray-400" />
                          {property.bathrooms} bathrooms
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          ${property.pricePerNight}/night
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>

                      {/* Amenities */}
                      {amenities.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-2">
                            {amenities.slice(0, 6).map((amenity: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {amenity}
                              </span>
                            ))}
                            {amenities.length > 6 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{amenities.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Host Info */}
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Host Information:</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {property.host.firstName} {property.host.lastName}
                            </p>
                            <p className="text-xs text-gray-600">{property.host.email}</p>
                            {property.host.phone && (
                              <p className="text-xs text-gray-600">{property.host.phone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">
                              Member since {formatDate(property.host.memberSince)}
                            </p>
                            {property.host.kycCompleted ? (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                KYC Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded text-xs mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                KYC Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Submission Date */}
                      {property.submittedForReviewAt && (
                        <p className="text-xs text-gray-500 mb-4">
                          Submitted: {formatDate(property.submittedForReviewAt)}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            setReviewModal({ show: true, action: 'approve' });
                          }}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            setReviewModal({ show: true, action: 'reject' });
                          }}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                        <Link
                          href={`/property/${property.id}`}
                          target="_blank"
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties to review</h3>
            <p className="text-gray-600">All properties have been reviewed</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.show && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewModal.action === 'approve' ? 'Approve Property' : 'Reject Property'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Property:</span> {selectedProperty.title}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Host:</span> {selectedProperty.host.firstName} {selectedProperty.host.lastName}
              </p>
            </div>

            {reviewModal.action === 'approve' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this property is being rejected..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to the host
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setReviewModal({ show: false, action: null });
                  setSelectedProperty(null);
                  setReviewNotes('');
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={submitting || (reviewModal.action === 'reject' && !rejectionReason.trim())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  reviewModal.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                    : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {reviewModal.action === 'approve' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Property
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Property
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages}
        index={lightboxIndex}
      />
    </div>
  );
}
