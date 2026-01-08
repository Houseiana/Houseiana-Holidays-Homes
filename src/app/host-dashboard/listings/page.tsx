'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, DollarSign, LayoutGrid, List, Check, CheckCircle, CalendarDays, Award, Sparkles, Star, Building2
} from 'lucide-react';

import { useHostListings, Listing, ListingStatus, ListingSortBy, ViewMode } from '@/hooks';

// Status configuration
import {
  ListingCard,
  ListingRow,
  StatCard
} from '@/features/host/components';

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

  const handleDeleteListing = (id: string) => {
    router.push(`/host-dashboard/add-listing?id=${id}`);
  };

  const handleViewCalendar = (id: string) => {
    router.push(`/host-dashboard/calendar?property=${id}`);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'INACTIVE' : 'PUBLISHED';
    const isActive = newStatus === 'PUBLISHED';
    try {
      await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, isActive }),
      });
      // In a real app we would refetch or update optimistic state here
      // For now we assume the parent refreshes or we rely on the next fetch cycle
      window.location.reload(); // Simple reload to reflect changes as we don't have direct access to setListings
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleBlock = (id: string) => {
    router.push(`/host-dashboard/calendar?property=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                onDelete={() => handleDeleteListing(listing.id)}
                onToggleStatus={() => handleToggleStatus(listing.id, listing.status)}
                onBlock={() => handleBlock(listing.id)}
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
