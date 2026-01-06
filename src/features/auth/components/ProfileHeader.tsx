'use client';

import { useState } from 'react';
import { Camera, MapPin, Calendar, Shield, Star, MessageCircle } from 'lucide-react';
import { PublicProfile } from '@/types/profile';

interface ProfileHeaderProps {
  profile: PublicProfile;
  isOwnProfile?: boolean;
  onEditPhoto?: () => void;
  onMessage?: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile = false,
  onEditPhoto,
  onMessage,
}: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const formatMemberSince = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getVerificationCount = () => {
    return profile.verifications.filter((v) => v.status === 'verified').length;
  };

  const getAverageRating = () => {
    if (profile.hostProfile?.averageRating) {
      return profile.hostProfile.averageRating.toFixed(1);
    }
    if (profile.guestProfile?.averageRating) {
      return profile.guestProfile.averageRating.toFixed(1);
    }
    return null;
  };

  const getTotalReviews = () => {
    return profile.reviews.summary.totalReviews;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cover Gradient */}
      <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600" />

      <div className="px-6 pb-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              {profile.user.profilePhoto && !imageError ? (
                <img
                  src={profile.user.profilePhoto}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-3xl font-bold">
                  {profile.initials}
                </div>
              )}
            </div>

            {/* Verified Badge */}
            {getVerificationCount() >= 2 && (
              <div className="absolute bottom-1 right-1 p-1.5 bg-green-500 rounded-full border-2 border-white">
                <Shield size={12} className="text-white" />
              </div>
            )}

            {/* Edit Photo Button (own profile only) */}
            {isOwnProfile && onEditPhoto && (
              <button
                onClick={onEditPhoto}
                className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full shadow-md hover:bg-gray-800 transition-colors"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          {/* Name and Basic Info */}
          <div className="flex-1 text-center sm:text-left sm:mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Member since {formatMemberSince(profile.memberSince)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && onMessage && (
            <div className="mt-4 sm:mt-0 sm:mb-2">
              <button
                onClick={onMessage}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                <MessageCircle size={18} />
                Message
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-6 flex items-center justify-center sm:justify-start gap-8">
          {/* Rating */}
          {getAverageRating() && (
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-gray-900">{getAverageRating()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Rating</p>
            </div>
          )}

          {/* Reviews */}
          {getTotalReviews() > 0 && (
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{getTotalReviews()}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {getTotalReviews() === 1 ? 'Review' : 'Reviews'}
              </p>
            </div>
          )}

          {/* Verifications */}
          {getVerificationCount() > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Shield size={18} className="text-green-500" />
                <span className="text-xl font-bold text-gray-900">{getVerificationCount()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Verified</p>
            </div>
          )}

          {/* Host Properties */}
          {profile.hostProfile && profile.hostProfile.activeProperties > 0 && (
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{profile.hostProfile.activeProperties}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {profile.hostProfile.activeProperties === 1 ? 'Listing' : 'Listings'}
              </p>
            </div>
          )}

          {/* Guest Trips */}
          {profile.guestProfile && profile.guestProfile.totalBookings > 0 && (
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{profile.guestProfile.totalBookings}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {profile.guestProfile.totalBookings === 1 ? 'Trip' : 'Trips'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
