'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import {
  ProfileHeader,
  ProfileVerification,
  ProfileStats,
  ProfileReviews,
  ProfileProperties,
} from '@/features/auth/components';
import { useProfile } from '@/hooks/use-profile';
import { useAuthStore } from '@/store/auth-store';
import { ProfileViewContext } from '@/types/profile';
import { useUser } from '@clerk/nextjs';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { user : currentUser } = useUser()
  const { profile, loading, error, fetchProfile } = useProfile({ userId, autoFetch: true });
  console.log(profile)

  const [viewContext, setViewContext] = useState<ProfileViewContext>('public');

  // Determine view context
  // useEffect(() => {
  //   if (!profile || !currentUser) {
  //     setViewContext('public');
  //     return;
  //   }

  //   if (currentUser.userId === profile.user.id) {
  //     setViewContext('self');
  //   } else if (profile.user.isHost && currentUser.currentRole === 'guest') {
  //     setViewContext('guest_viewing_host');
  //   } else if (profile.user.isGuest && currentUser.currentRole === 'host') {
  //     setViewContext('host_viewing_guest');
  //   } else {
  //     setViewContext('public');
  //   }
  // }, [profile, currentUser]);

  const isOwnProfile = viewContext === 'self';

  const handleMessage = () => {
    if (profile) {
      router.push(`/messages?user=${profile.user.id}`);
    }
  };

  const handleEditPhoto = () => {
    router.push('/account/profile');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6">
            {error || "We couldn't find the profile you're looking for."}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditPhoto={handleEditPhoto}
            onMessage={!isOwnProfile ? handleMessage : undefined}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Info & Stats */}
            <div className="space-y-6">
              {/* About Section - Moved to top left */}
              {profile.aboutMe && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    About {profile.user.firstName}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{profile.aboutMe}</p>
                </div>
              )}

              <ProfileVerification
                verifications={profile.verifications}
                trustIndicators={profile.trustIndicators}
                isOwnProfile={isOwnProfile}
              />

              <ProfileStats
                hostProfile={profile.hostProfile}
                guestProfile={profile.guestProfile}
                viewContext={viewContext === 'self' ? 'self' : viewContext === 'guest_viewing_host' ? 'guest_viewing_host' : 'host_viewing_guest'}
              />
            </div>

            {/* Right Column - Properties & Reviews */}
            <div className="lg:col-span-2 space-y-8">
               {/* Host Business Description */}
               {profile.hostProfile?.businessDescription && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {profile.hostProfile.businessName || `${profile.user.firstName}'s Hosting`}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {profile.hostProfile.businessDescription}
                  </p>
                </div>
              )}

              {/* Properties (if host) */}
              {profile.properties && profile.properties.length > 0 && (
                <ProfileProperties
                  properties={profile.properties}
                  hostName={profile.user.firstName}
                />
              )}

              {/* Reviews */}
              <ProfileReviews
                summary={profile.reviews.summary}
                reviews={profile.reviews.items}
                hostId={profile.user.id}
                currentUser={currentUser}
                // hasMore={reviewsPagination?.hasMore || profile.reviews.hasMore}
                // onLoadMore={loadMoreReviews}
                // loading={reviewsLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Safety Note */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6">
          <h4 className="font-bold text-gray-900 mb-2">Trust & Safety</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Houseiana verifies personal information to help keep our community safe. When you
            share your home or book a stay, you can trust that the person on the other side has
            been verified. We never share your personal information publicly without your consent.
          </p>
        </div>
      </div>
    </div>
  );
}
