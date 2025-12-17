'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Home, Calendar, Building2, Menu, Plus, Search,
  DollarSign, Users, Edit, Star, LayoutGrid, List, Eye, MoreHorizontal,
  MapPin, Bed, Bath, Image as ImageIcon, CheckCircle, XCircle,
  Zap, Award, Sparkles, Pause as PauseIcon, FileText, Camera, Check, AlertCircle,
  CalendarDays, Globe,
} from 'lucide-react';

import { useHostListings, Listing, ListingStatus, ListingSortBy, ViewMode } from '@/hooks';

// Status configuration
const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500', icon: PauseIcon },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400', icon: FileText },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500', icon: XCircle },
};

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

// Presentational Components
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
}

function StatCard({ label, value, icon, iconBgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface ListingCardProps {
  listing: Listing;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onViewCalendar: () => void;
}

function ListingCard({ listing, isSelected, onToggleSelect, onView, onEdit, onViewCalendar }: ListingCardProps) {
  const status = statusConfig[listing.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
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
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          {listing.guestFavorite && (
            <div className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-900 shadow">
              Guest favorite
            </div>
          )}
          {listing.superhostBadge && (
            <div className="px-2 py-1 bg-white rounded-full shadow">
              <Award className="w-4 h-4 text-amber-500" />
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className={`absolute bottom-3 left-3 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-teal-600 border-teal-600'
              : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </button>

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onView} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={onEdit} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={onViewCalendar} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
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
    </div>
  );
}

interface ListingRowProps {
  listing: Listing;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onViewCalendar: () => void;
}

function ListingRow({ listing, isSelected, onToggleSelect, onView, onEdit, onViewCalendar }: ListingRowProps) {
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

// Main Page Component
export default function HouseianaHostListings() {
  const { user } = useUser();
  const router = useRouter();

  // UI-only state (stays in page)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hook provides all data and business logic
  const {
    filteredListings,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    selectedListings,
    toggleListingSelection,
    selectAllListings,
    clearSelection,
    bulkActivate,
    bulkPause,
    bulkDelete,
  } = useHostListings(user?.id);

  // Navigation handlers (stay in page since they use router)
  const handleViewListing = (id: string) => {
    window.open(`/property/${id}`, '_blank');
  };

  const handleEditListing = (id: string) => {
    router.push(`/host-dashboard/add-listing?id=${id}`);
  };

  const handleViewCalendar = (id: string) => {
    router.push(`/host-dashboard/calendar?property=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Home className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-teal-600">Houseiana</span>
            </a>

            <nav className="hidden md:flex items-center gap-1">
              <a href="/host-dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
                Today
              </a>
              <a href="/host-dashboard/calendar" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
                Calendar
              </a>
              <a href="/host-dashboard/listings" className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-full">
                Listings
              </a>
              <a href="/host-dashboard/messages" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full relative">
                Messages
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <a href="/client-dashboard" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full">
                Switch to traveling
              </a>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 pl-3 border border-gray-300 rounded-full hover:shadow-md"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm">
                  M
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Your listings</h1>
            <p className="text-gray-500 mt-1">{stats.total} {stats.total === 1 ? 'property' : 'properties'}</p>
          </div>
          <a
            href="/host-dashboard/add-listing"
            className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create listing
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Active listings"
            value={stats.active}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            iconBgColor="bg-green-100"
          />
          <StatCard
            label="Upcoming bookings"
            value={stats.totalBookings}
            icon={<CalendarDays className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-100"
          />
          <StatCard
            label="This month"
            value={`QAR ${stats.totalEarnings.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            iconBgColor="bg-emerald-100"
          />
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-semibold text-gray-900">{stats.avgRating}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'all' as ListingStatus, label: 'All', count: stats.total },
                { id: 'active' as ListingStatus, label: 'Active', count: stats.active },
                { id: 'paused' as ListingStatus, label: 'Paused', count: stats.paused },
                { id: 'draft' as ListingStatus, label: 'Draft', count: stats.draft },
                { id: 'inactive' as ListingStatus, label: 'Inactive', count: stats.inactive },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedStatus === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ListingSortBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="rating">Highest rated</option>
                <option value="bookings">Most booked</option>
              </select>

              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <LayoutGrid className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedListings.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">{selectedListings.length} selected</span>
              <button onClick={bulkActivate} className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                Activate
              </button>
              <button onClick={bulkPause} className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                Pause
              </button>
              <button onClick={bulkDelete} className="text-sm text-red-600 hover:text-red-700 font-medium">
                Delete
              </button>
              <button onClick={clearSelection} className="text-sm text-gray-500 hover:text-gray-700 ml-auto">
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your listings...</p>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSelected={selectedListings.includes(listing.id)}
                onToggleSelect={() => toggleListingSelection(listing.id)}
                onView={() => handleViewListing(listing.id)}
                onEdit={() => handleEditListing(listing.id)}
                onViewCalendar={() => handleViewCalendar(listing.id)}
              />
            ))}
          </div>
        )}

        {/* Listings List View */}
        {!loading && viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                      onChange={selectAllListings}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Listing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Instant Book</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map(listing => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    isSelected={selectedListings.includes(listing.id)}
                    onToggleSelect={() => toggleListingSelection(listing.id)}
                    onView={() => handleViewListing(listing.id)}
                    onEdit={() => handleEditListing(listing.id)}
                    onViewCalendar={() => handleViewCalendar(listing.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No listings found' : 'No listings yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search or filters.'
                : 'Create your first listing to start hosting guests and earning money.'}
            </p>
            {!searchQuery && (
              <a
                href="/host-dashboard/add-listing"
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
              >
                <Plus className="w-5 h-5" />
                Create your first listing
              </a>
            )}
          </div>
        )}

        {/* Pro Tips */}
        {stats.total > 0 && (
          <div className="mt-8 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-900">Tips to boost your listings</h3>
                <ul className="mt-2 space-y-1 text-sm text-teal-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600" />
                    Add at least 20 high-quality photos to each listing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600" />
                    Enable Instant Book to attract more guests
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600" />
                    Respond to inquiries within 1 hour for better rankings
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600" />
                    Keep your calendar up to date to avoid cancellations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
