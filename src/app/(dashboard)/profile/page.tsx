/**
 * Profile Page
 * User profile management using Clerk
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await user?.update({
        firstName,
        lastName,
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Reload to get updated data
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleBecomeHost = async () => {
    if (!confirm('Would you like to become a host and start listing properties?')) return;

    try {
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          isHost: true,
        },
      });

      alert('You are now a host! Redirecting to host dashboard...');
      router.push('/host/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to become host');
    }
  };

  if (!isLoaded) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">User not found</p>
      </div>
    );
  }

  const isHost = user.publicMetadata?.isHost as boolean || false;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => {
              setFirstName(user.firstName || '');
              setLastName(user.lastName || '');
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Display */}
      {!isEditing && (
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">First Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.firstName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.lastName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
                <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-sm font-mono text-gray-600 break-all">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-medium text-gray-900">
                  {isHost ? 'Host' : 'Guest'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Sign In</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Become Host */}
          {!isHost && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Become a Host
                  </h3>
                  <p className="text-gray-600">
                    Start earning by renting out your property to guests from around the world.
                  </p>
                </div>
                <button
                  onClick={handleBecomeHost}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap ml-4"
                >
                  Become a Host
                </button>
              </div>
            </div>
          )}

          {/* Host Badge */}
          {isHost && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⭐</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Host Account</h3>
                  <p className="text-gray-600">
                    You have access to host features. Visit the{' '}
                    <a href="/host/dashboard" className="text-blue-600 hover:underline">
                      Host Dashboard
                    </a>
                    {' '}to manage your properties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
                setSuccess('');
              }}
              disabled={updating}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
