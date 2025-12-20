// Profile Types for Houseiana User Platform
// Peer-to-peer profile system for trust and comfort

// Verification Status
export type VerificationStatus = 'verified' | 'pending' | 'not_verified';

export interface VerificationBadge {
  type: 'identity' | 'email' | 'phone' | 'government_id';
  status: VerificationStatus;
  verifiedAt?: string;
}

// Trust Indicators
export interface TrustIndicator {
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
}

// Review Summary
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Individual Review
export interface ProfileReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
  propertyTitle?: string;
  stayDate?: string;
  response?: {
    content: string;
    respondedAt: string;
  };
}

// Guest Profile (when a host views a guest)
export interface GuestProfileData {
  id: string;
  userId: string;
  travelPurpose?: string;
  favoriteDestinations: string[];
  totalBookings: number;
  totalNightsStayed: number;
  averageRating?: number;
  memberSince: string;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

// Host Profile (when a guest views a host)
export interface HostProfileData {
  id: string;
  userId: string;
  hostType: 'INDIVIDUAL' | 'PROFESSIONAL' | 'COMPANY';
  businessName?: string;
  businessDescription?: string;
  isVerifiedHost: boolean;
  verifiedAt?: string;
  verificationLevel: 'BASIC' | 'ENHANCED' | 'PREMIUM';
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  averageRating?: number;
  totalReviews: number;
  responseRate?: number;
  responseTime?: number; // in minutes
  acceptanceRate?: number;
  cancellationRate?: number;
  autoAcceptBookings: boolean;
  instantBookEnabled: boolean;
  memberSince: string;
}

// Base User Info (shared between Guest and Host views)
export interface BaseUserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  nationality?: string;
  preferredLanguage: string;
  isGuest: boolean;
  isHost: boolean;
  kycStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

// Complete Public Profile (what others can see)
export interface PublicProfile {
  user: BaseUserInfo;
  displayName: string;
  initials: string;
  memberSince: string;
  aboutMe?: string;
  location?: string;
  verifications: VerificationBadge[];
  trustIndicators: TrustIndicator[];

  // Conditional based on role being viewed
  guestProfile?: GuestProfileData;
  hostProfile?: HostProfileData;

  // Reviews received
  reviews: {
    summary: ReviewSummary;
    items: ProfileReview[];
    hasMore: boolean;
  };

  // Host-specific: Properties (if viewing as guest)
  properties?: {
    id: string;
    title: string;
    city: string;
    coverPhoto?: string;
    pricePerNight: number;
    averageRating?: number;
    reviewCount: number;
  }[];
}

// Profile View Context
export type ProfileViewContext = 'guest_viewing_host' | 'host_viewing_guest' | 'self' | 'public';

// API Response Types
export interface ProfileApiResponse {
  success: boolean;
  data?: PublicProfile;
  error?: string;
}

export interface ProfileReviewsResponse {
  success: boolean;
  data?: {
    reviews: ProfileReview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

// Profile Update Request (for editing own profile)
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  nationality?: string;
  preferredLanguage?: string;
  aboutMe?: string;
}

// Host Profile Stats (for dashboard)
export interface HostStats {
  totalEarnings: number;
  pendingPayouts: number;
  activeListings: number;
  upcomingReservations: number;
  responseRate: number;
  averageRating: number;
  totalReviews: number;
  superHostStatus: boolean;
}

// Guest Profile Stats (for dashboard)
export interface GuestStats {
  totalTrips: number;
  upcomingTrips: number;
  totalSpent: number;
  travelPoints: number;
  loyaltyTier: string;
  savedProperties: number;
  reviewsWritten: number;
}
