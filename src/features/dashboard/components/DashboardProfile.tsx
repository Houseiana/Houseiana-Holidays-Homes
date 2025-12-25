'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Bell, Globe, Camera, Check, Clock, Loader2 } from 'lucide-react';
import { useMyProfile } from '@/hooks/use-profile';

export default function DashboardProfile() {
  const { profile, loading, error, updateProfile } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    nationality: '',
  });
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        nationality: profile.nationality || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile(formData);
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create FormData and upload
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          await updateProfile({ profilePhoto: data.url });
        }
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
    }
  };

  const getVerificationStatus = (type: string) => {
    if (!profile?.verifications) return 'not_verified';
    const verification = profile.verifications.find((v: any) => v.type === type);
    return verification?.status || 'not_verified';
  };

  const VerificationItem = ({ type, label }: { type: string; label: string }) => {
    const status = getVerificationStatus(type);
    const isVerified = status === 'verified';
    const isPending = status === 'pending';

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {type === 'identity' && <Shield size={18} className={isVerified ? 'text-green-500' : isPending ? 'text-yellow-500' : 'text-gray-400'} />}
          {type === 'email' && <Mail size={18} className={isVerified ? 'text-green-500' : isPending ? 'text-yellow-500' : 'text-gray-400'} />}
          {type === 'phone' && <Phone size={18} className={isVerified ? 'text-green-500' : isPending ? 'text-yellow-500' : 'text-gray-400'} />}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {isVerified ? (
          <span className="text-green-500 text-xs font-bold flex items-center gap-1">
            <Check size={12} />
            Done
          </span>
        ) : isPending ? (
          <span className="text-yellow-500 text-xs font-bold flex items-center gap-1">
            <Clock size={12} />
            Pending
          </span>
        ) : (
          <button className="text-orange-600 text-xs font-bold hover:text-orange-700">Verify</button>
        )}
      </div>
    );
  };

  // Loading State
  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Shield size={32} className="text-red-500" />
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'User';
  const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {profile?.profilePhoto && !imageError ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-3xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-md hover:bg-orange-700 transition-colors"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
            <p className="text-gray-500 text-sm mb-4">
              {profile?.guestProfile?.loyaltyTier ? `${profile.guestProfile.loyaltyTier} Member` : 'Member'}
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {profile?.kycStatus === 'APPROVED' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Verified Identity
                </span>
              )}
              {profile?.isHost && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  Host
                </span>
              )}
              {profile?.isGuest && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  Guest
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-4">
              <VerificationItem type="identity" label="Identity Verified" />
              <VerificationItem type="email" label="Email Confirmed" />
              <VerificationItem type="phone" label="Phone Verified" />
            </div>
          </div>

          {/* Stats Card */}
          {profile && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.guestStats && (
                  <>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{profile.guestStats.totalTrips}</p>
                      <p className="text-xs text-gray-500">Trips</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{profile.guestStats.savedProperties}</p>
                      <p className="text-xs text-gray-500">Saved</p>
                    </div>
                  </>
                )}
                {profile.hostStats && (
                  <>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{profile.hostStats.activeListings}</p>
                      <p className="text-xs text-gray-500">Listings</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">
                        {profile.hostStats.averageRating ? profile.hostStats.averageRating.toFixed(1) : '-'}
                      </p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={isEditing ? formData.firstName : profile?.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-75"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={isEditing ? formData.lastName : profile?.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-75"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none opacity-75"
                  />
                </div>
                <p className="text-xs text-gray-400">Contact support to change your email</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={isEditing ? formData.phone : profile?.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-75"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nationality</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={isEditing ? formData.nationality : profile?.nationality || ''}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your nationality"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-75"
                  />
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        phone: profile.phone || '',
                        nationality: profile.nationality || '',
                      });
                    }
                  }}
                  className="px-6 py-3 text-gray-600 font-bold hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Bell size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Notifications</h4>
                    <p className="text-xs text-gray-500">Receive updates about your bookings</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                  <span className="absolute left-0 inline-block w-6 h-6 bg-white border border-gray-200 rounded-full shadow transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Globe size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Language & Currency</h4>
                    <p className="text-xs text-gray-500">
                      {profile?.preferredLanguage === 'en' ? 'English (US)' : profile?.preferredLanguage || 'English'} - {profile?.preferredCurrency || 'USD'} ({profile?.preferredCurrency === 'QAR' ? '\u{FDFC}' : '$'})
                    </p>
                  </div>
                </div>
                <button className="text-sm font-bold text-orange-600 hover:text-orange-700">Edit</button>
              </div>
            </div>
          </div>

          {/* View Public Profile */}
          {profile && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">View Your Public Profile</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    See how others view your profile on Houseiana
                  </p>
                </div>
                <a
                  href={`/profile/${profile.id}`}
                  className="px-6 py-2.5 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                >
                  View Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
