export interface Booking {
  id: string;
  propertyId: string;
  guestId?: string;
  hostId?: string;
  userId?: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: BookingStatus;
  payment?: BookingPayment;
  guest?: BookingGuest;
  property: BookingProperty;
  specialRequests?: string;
  hostNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
  cancellation?: BookingCancellation;
  review?: BookingReview;
  totalPrice?: number;
  currency?: string;
}

export interface BookingGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  verificationStatus: VerificationStatus;
  memberSince: Date;
  totalBookings: number;
  averageRating: number;
}

export interface BookingProperty {
  id: string;
  title: string;
  address: string;
  photos: string[];
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  pricePerNight?: number;
  amenities?: string[];
  ratings?: {
    overall: number;
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
  totalReviews?: number;
}

export interface BookingPayment {
  totalAmount: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  payoutAmount: number;
  payoutStatus: PayoutStatus;
}

export interface BookingCancellation {
  cancelledBy: 'guest' | 'host';
  cancelledAt: Date;
  reason: string;
  refundAmount: number;
  cancellationPolicy: string;
}

export interface BookingReview {
  guestReview?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  hostReview?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PHONE_VERIFIED = 'phone_verified',
  EMAIL_VERIFIED = 'email_verified',
  ID_VERIFIED = 'id_verified',
  FULLY_VERIFIED = 'fully_verified'
}

export interface BookingFilter {
  status?: BookingStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  propertyId?: string;
  search?: string;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
  responseRate: number;
  averageRating: number;
}
