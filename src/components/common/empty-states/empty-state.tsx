/**
 * Empty State Components
 * Provides friendly messages when there's no data to display
 */

import Link from 'next/link';
import {
  Calendar,
  Heart,
  Home,
  MessageCircle,
  Search,
  Inbox,
  FileX,
  type LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>

      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoTripsEmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h4>
      <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
      <Link
        href="/discover"
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Search className="w-4 h-4 mr-2" />
        Explore Properties
      </Link>
    </div>
  );
}

export function NoFavoritesEmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">No saved properties yet</h4>
      <p className="text-gray-600 mb-4">Save properties to your wishlist to view them later</p>
      <Link
        href="/discover"
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Start exploring
      </Link>
    </div>
  );
}

export function NoPropertiesEmptyState() {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h4 className="text-xl font-medium text-gray-900 mb-2">No properties listed yet</h4>
      <p className="text-gray-600 mb-6">Start earning by listing your first property</p>
      <Link
        href="/host-dashboard/add-listing"
        className="inline-flex items-center px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium"
      >
        <Home className="w-5 h-5 mr-2" />
        List Your Property
      </Link>
    </div>
  );
}

export function NoMessagesEmptyState() {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h4 className="text-xl font-medium text-gray-900 mb-2">No messages yet</h4>
      <p className="text-gray-600">Your conversations with hosts and guests will appear here</p>
    </div>
  );
}

export function NoResultsEmptyState() {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h4 className="text-xl font-medium text-gray-900 mb-2">No results found</h4>
      <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}

export function PastTripsEmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-2" />
      <p>No past trips yet</p>
    </div>
  );
}
