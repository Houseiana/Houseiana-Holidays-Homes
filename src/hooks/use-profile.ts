import { useState, useEffect, useCallback } from 'react';
import { PublicProfile, ProfileReview, ProfileApiResponse, ProfileReviewsResponse } from '@/types/profile';
import { UserAPI } from '@/lib/api/backend-api';

interface UseProfileOptions {
  userId?: string;
  autoFetch?: boolean;
}

interface UseProfileReturn {
  profile: PublicProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage a user's public profile
 */
export function useProfile({ userId, autoFetch = true }: UseProfileOptions = {}): UseProfileReturn {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);

  const fetchProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setCurrentUserId(id);

    try {
      // Use the centralized UserAPI instead of local API route
      const response = await UserAPI.getById(id);
debugger
      if (response.success && response.data) {
        const userData = response.data.user;
        // Map backend User type to PublicProfile type
        // This mapping ensures the frontend has the structure it expects
        const publicProfile: PublicProfile = {
          user: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePhoto: userData.profilePhoto, // Updated field name
            nationality: userData.nationality,
            preferredLanguage: userData.preferredLanguage || 'en',
            isGuest: userData.role === 'guest' || userData.role === 'GUEST_AND_HOST',
            isHost: userData.role === 'host' || userData.role === 'GUEST_AND_HOST',
            kycStatus: userData.kycStatus, // Direct mapping
            emailVerified: userData.emailVerified,
            phoneVerified: userData.phoneVerified,
            createdAt: userData.createdAt || new Date().toISOString(),
          },
          displayName: `${userData.firstName} ${userData.lastName}`.trim(),
          initials: ((userData.firstName?.[0] || '') + (userData.lastName?.[0] || '')).toUpperCase(),
          memberSince: userData.createdAt || new Date().toISOString(),
          aboutMe: undefined,
          location: undefined,
          verifications: [
            {
              type: 'email',
              status: userData.emailVerified ? 'verified' : 'pending',
            },
            {
              type: 'phone',
              status: userData.phoneVerified ? 'verified' : userData.phone ? 'pending' : 'not_verified',
            },
            {
              type: 'identity',
              status: userData.kycStatus === 'APPROVED' ? 'verified' : userData.kycStatus === 'PENDING' ? 'pending' : 'not_verified',
            }
          ],
          trustIndicators: [],
          reviews: (() => {
            const ratings = userData.hostRatings || [];
            const transformReviews = ratings.map(r => ({
              id: r.id,
              reviewerId: r.guestId,
              reviewerName: r.guest ? `${r.guest.firstName} ${r.guest.lastName}` : 'Anonymous',
              reviewerPhoto: r.guest?.profilePhoto,
              rating: r.ratingValue,
              comment: r.comment,
              createdAt: r.createdAt
            }));

            const totalReviews = ratings.length;
            const averageRating = totalReviews > 0 
              ? ratings.reduce((acc, r) => acc + r.ratingValue, 0) / totalReviews 
              : 0;

            const ratingBreakdown = {
              5: ratings.filter(r => Math.round(r.ratingValue) === 5).length,
              4: ratings.filter(r => Math.round(r.ratingValue) === 4).length,
              3: ratings.filter(r => Math.round(r.ratingValue) === 3).length,
              2: ratings.filter(r => Math.round(r.ratingValue) === 2).length,
              1: ratings.filter(r => Math.round(r.ratingValue) === 1).length,
            };

            return {
              summary: {
                averageRating,
                totalReviews,
                ratingBreakdown
              },
              items: transformReviews
            };
          })(),
        };
        
        setProfile(publicProfile);
      } else {
        setError(response.error || 'Failed to fetch profile');
        setProfile(null);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (currentUserId) {
      await fetchProfile(currentUserId);
    }
  }, [currentUserId, fetchProfile]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchProfile(userId);
    }
  }, [autoFetch, userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    refetch,
  };
}

interface UseProfileReviewsOptions {
  userId?: string;
  role?: 'host' | 'guest';
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseProfileReviewsReturn {
  reviews: ProfileReview[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  fetchReviews: (options?: { page?: number }) => Promise<void>;
  loadMore: () => Promise<void>;
}

interface UseMyProfileReturn {
  profile: any;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage the current user's own profile
 */
export function useMyProfile(): UseMyProfileReturn {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/me');
      const data = await response.json();

      if (data.success && data.data) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Failed to fetch profile');
        setProfile(null);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: any): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh profile data
        await fetchProfile();
        return true;
      } else {
        setError(result.error || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    refetch: fetchProfile,
  };
}
