'use client';

import {
  Home,
  Clock,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Award,
  Plane,
  Moon,
  Star,
  Zap,
} from 'lucide-react';
import { HostProfileData, GuestProfileData } from '@/types/profile';

interface ProfileStatsProps {
  hostProfile?: HostProfileData;
  guestProfile?: GuestProfileData;
  viewContext?: 'host_viewing_guest' | 'guest_viewing_host' | 'self';
}

export default function ProfileStats({
  hostProfile,
  guestProfile,
  viewContext = 'self',
}: ProfileStatsProps) {
  // Show host stats when guest is viewing host profile
  if (viewContext === 'guest_viewing_host' && hostProfile) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Host Information</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Response Rate */}
          {hostProfile.responseRate && (
            <StatCard
              icon={<MessageSquare size={20} className="text-blue-500" />}
              label="Response Rate"
              value={`${Math.round(hostProfile.responseRate)}%`}
              bgColor="bg-blue-50"
            />
          )}

          {/* Response Time */}
          {hostProfile.responseTime && (
            <StatCard
              icon={<Clock size={20} className="text-purple-500" />}
              label="Response Time"
              value={formatResponseTime(hostProfile.responseTime)}
              bgColor="bg-purple-50"
            />
          )}

          {/* Acceptance Rate */}
          {hostProfile.acceptanceRate && (
            <StatCard
              icon={<CheckCircle size={20} className="text-green-500" />}
              label="Acceptance Rate"
              value={`${Math.round(hostProfile.acceptanceRate)}%`}
              bgColor="bg-green-50"
            />
          )}

          {/* Total Bookings */}
          {hostProfile.totalBookings > 0 && (
            <StatCard
              icon={<TrendingUp size={20} className="text-orange-500" />}
              label="Total Bookings"
              value={hostProfile.totalBookings.toString()}
              bgColor="bg-orange-50"
            />
          )}

          {/* Active Listings */}
          {hostProfile.activeProperties > 0 && (
            <StatCard
              icon={<Home size={20} className="text-teal-500" />}
              label="Active Listings"
              value={hostProfile.activeProperties.toString()}
              bgColor="bg-teal-50"
            />
          )}

          {/* Superhost Badge */}
          {hostProfile.isVerifiedHost && (
            <StatCard
              icon={<Award size={20} className="text-yellow-500" />}
              label="Verified Host"
              value="Yes"
              bgColor="bg-yellow-50"
            />
          )}
        </div>

        {/* Instant Book & Auto Accept */}
        <div className="mt-4 flex flex-wrap gap-2">
          {hostProfile.instantBookEnabled && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <Zap size={12} />
              Instant Book
            </span>
          )}
          {hostProfile.autoAcceptBookings && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <CheckCircle size={12} />
              Auto Accept
            </span>
          )}
        </div>

        {/* Cancellation Rate Warning */}
        {hostProfile.cancellationRate && hostProfile.cancellationRate > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">
              Cancellation rate: {Math.round(hostProfile.cancellationRate)}%
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show guest stats when host is viewing guest profile
  if (viewContext === 'host_viewing_guest' && guestProfile) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Guest Information</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Total Trips */}
          <StatCard
            icon={<Plane size={20} className="text-blue-500" />}
            label="Total Trips"
            value={guestProfile.totalBookings.toString()}
            bgColor="bg-blue-50"
          />

          {/* Nights Stayed */}
          <StatCard
            icon={<Moon size={20} className="text-purple-500" />}
            label="Nights Stayed"
            value={guestProfile.totalNightsStayed.toString()}
            bgColor="bg-purple-50"
          />

          {/* Guest Rating */}
          {guestProfile.averageRating && (
            <StatCard
              icon={<Star size={20} className="text-yellow-500" />}
              label="Guest Rating"
              value={guestProfile.averageRating.toFixed(1)}
              bgColor="bg-yellow-50"
            />
          )}

          {/* Loyalty Tier */}
          {guestProfile.loyaltyTier !== 'BRONZE' && (
            <StatCard
              icon={<Award size={20} className="text-orange-500" />}
              label="Loyalty Tier"
              value={guestProfile.loyaltyTier}
              bgColor="bg-orange-50"
            />
          )}
        </div>

        {/* Travel Purpose */}
        {guestProfile.travelPurpose && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">
              Usually travels for: <span className="font-medium text-gray-700">{guestProfile.travelPurpose}</span>
            </p>
          </div>
        )}

        {/* Member Since */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">
            Houseiana member since {new Date(guestProfile.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    );
  }

  // Default view - show both for self profile
  return (
    <div className="space-y-6">
      {/* Host Stats */}
      {hostProfile && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Hosting Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Home size={20} className="text-teal-500" />}
              label="Active Listings"
              value={hostProfile.activeProperties.toString()}
              bgColor="bg-teal-50"
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-orange-500" />}
              label="Total Bookings"
              value={hostProfile.totalBookings.toString()}
              bgColor="bg-orange-50"
            />
            {hostProfile.averageRating && (
              <StatCard
                icon={<Star size={20} className="text-yellow-500" />}
                label="Rating"
                value={hostProfile.averageRating.toFixed(1)}
                bgColor="bg-yellow-50"
              />
            )}
          </div>
        </div>
      )}

      {/* Guest Stats */}
      {guestProfile && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Travel Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Plane size={20} className="text-blue-500" />}
              label="Total Trips"
              value={guestProfile.totalBookings.toString()}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<Moon size={20} className="text-purple-500" />}
              label="Nights Stayed"
              value={guestProfile.totalNightsStayed.toString()}
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={<Award size={20} className="text-orange-500" />}
              label="Loyalty Tier"
              value={guestProfile.loyaltyTier}
              bgColor="bg-orange-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}

function StatCard({ icon, label, value, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}
