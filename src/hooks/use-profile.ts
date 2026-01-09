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

      if (response.success && response.data) {
        const userData = response.data;
        
        // Map backend User type to PublicProfile type
        // This mapping ensures the frontend has the structure it expects
        const publicProfile: PublicProfile = {
          user: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePhoto: userData.avatar,
            nationality: undefined,
            preferredLanguage: 'en',
            isGuest: userData.role === 'guest',
            isHost: userData.role === 'host',
            kycStatus: userData.verified ? 'VERIFIED' : 'NOT_STARTED',
            emailVerified: true, // Assuming true if they exist in backend for now
            phoneVerified: !!userData.phone,
            createdAt: new Date().toISOString(), // Fallback if not provided
          },
          displayName: `${userData.firstName} ${userData.lastName}`.trim(),
          initials: ((userData.firstName?.[0] || '') + (userData.lastName?.[0] || '')).toUpperCase(),
          memberSince: new Date().toISOString(),
          aboutMe: undefined,
          location: undefined,
          verifications: [
            {
              type: 'email',
              status: 'verified',
            },
            ...(userData.verified ? [{
              type: 'identity' as const,
              status: 'verified' as const,
            }] : []),
          ],
          trustIndicators: [],
          reviews: {
            summary: {
              averageRating: 0,
              totalReviews: 0,
              ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            },
            items: [],
            hasMore: false,
          },
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

/**
 * Hook to fetch and manage a user's reviews with pagination
 */
export function useProfileReviews({
  userId,
  role = 'host',
  page = 1,
  limit = 10,
  autoFetch = true,
}: UseProfileReviewsOptions = {}): UseProfileReviewsReturn {
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProfileReviewsReturn['pagination']>(null);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchReviews = useCallback(
    async (options?: { page?: number; append?: boolean }) => {
      if (!userId) return;

      const fetchPage = options?.page ?? currentPage;
      const shouldAppend = options?.append ?? false;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: fetchPage.toString(),
          limit: limit.toString(),
          role,
        });

        const response = await fetch(`/api/users/${userId}/reviews?${params}`);
        const data: ProfileReviewsResponse = await response.json();

        if (data.success && data.data) {
          if (shouldAppend) {
            setReviews((prev) => [...prev, ...data.data!.reviews]);
          } else {
            setReviews(data.data.reviews);
          }
          setPagination(data.data.pagination);
          setCurrentPage(fetchPage);
        } else {
          setError(data.error || 'Failed to fetch reviews');
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    },
    [userId, role, limit, currentPage]
  );

  const loadMore = useCallback(async () => {
    if (pagination?.hasMore && !loading) {
      await fetchReviews({ page: currentPage + 1, append: true });
    }
  }, [pagination, loading, currentPage, fetchReviews]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchReviews({ page: 1 });
    }
  }, [autoFetch, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    reviews,
    loading,
    error,
    pagination,
    fetchReviews,
    loadMore,
  };
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
