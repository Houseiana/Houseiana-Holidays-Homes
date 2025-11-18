/**
 * Profile Page
 * User profile management using Clerk
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, Shield, Mail, IdCard, Copy, Check,
  Award, TrendingUp, Home, Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedUserId, setCopiedUserId] = useState(false);

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

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 5;

    if (user?.firstName) completed++;
    if (user?.lastName) completed++;
    if (user?.emailAddresses[0]) completed++;
    if (user?.imageUrl) completed++;
    if (user?.publicMetadata?.isHost) completed++;

    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const profileCompletion = user ? calculateProfileCompletion() : { completed: 0, total: 5, percentage: 0 };

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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and account settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setFirstName(user.firstName || '');
              setLastName(user.lastName || '');
              setIsEditing(true);
            }}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
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
          {/* Profile Header Card with Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
                <div className="flex items-end gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-xl">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.firstName || 'User'}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-4xl font-bold text-orange-600">
                            {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="pb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-900">Profile Strength</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {profileCompletion.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  {profileCompletion.completed} of {profileCompletion.total} steps completed
                  {profileCompletion.percentage < 100 && " • Complete your profile to unlock all features"}
                </p>
              </div>

              {/* Trust & Identity Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Trust & Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-100 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Email Address</p>
                        <p className="text-xs text-gray-500">Verified on {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="p-1.5 bg-green-100 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-100 rounded-lg">
                        <IdCard className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Government ID</p>
                        <p className="text-xs text-gray-500">Not verified yet</p>
                      </div>
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">First Name</p>
                <p className="text-base font-medium text-gray-900">
                  {user.firstName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Name</p>
                <p className="text-base font-medium text-gray-900">
                  {user.lastName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-base font-medium text-gray-900">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
                    {user.id.substring(0, 24)}...
                  </code>
                  <button
                    onClick={copyUserId}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                    title="Copy User ID"
                  >
                    {copiedUserId ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</p>
                <span className={`inline-flex items-center gap-1.5 mt-1 text-sm px-3 py-1.5 rounded-lg font-semibold ${
                  isHost
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <Home className="w-4 h-4" />
                  {isHost ? 'Host' : 'Guest'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Sign In</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Become Host - Premium Banner */}
          {!isHost && (
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-8 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Start Earning Today</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Become a Host
                    </h3>
                    <p className="text-orange-50 text-sm leading-relaxed max-w-xl">
                      Share your space and earn money while connecting with travelers from around the world.
                      Join thousands of hosts who trust Houseiana.
                    </p>
                    <div className="flex items-center gap-6 mt-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <p className="text-xs text-orange-100">Average earnings</p>
                          <p className="text-sm font-bold text-white">$2,500/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <span className="text-lg">⭐</span>
                        </div>
                        <div>
                          <p className="text-xs text-orange-100">Active hosts</p>
                          <p className="text-sm font-bold text-white">10,000+</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleBecomeHost}
                    className="px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
                  >
                    Get Started
                  </button>
                </div>
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
