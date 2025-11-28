// TypeScript interfaces for Inventory Management System

export interface Property {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  type: 'apartment' | 'house' | 'villa' | 'condo' | 'studio' | 'other';
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  description: string;
  images: string[];
  pricePerNight: number;
  currency: string;
  status: 'active' | 'suspended' | 'deleted' | 'pending_approval';
  hostId: string;
  host?: Host;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  rating?: number;
  reviewCount?: number;
  bookingCount?: number;
}

export interface Approval {
  id: string;
  propertyId: string;
  property?: Property;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  changesRequested?: string[];
  type: 'new_property' | 'property_update' | 'host_verification' | 'other';
  metadata?: Record<string, any>;
}

export interface BlockedDate {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  type: 'maintenance' | 'owner_use' | 'seasonal' | 'manual' | 'other';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  category: 'property_images' | 'property_documents' | 'host_documents' | 'verification' | 'legal' | 'other';
  description?: string;
  propertyId?: string;
  hostId?: string;
  status: 'active' | 'archived' | 'deleted';
  expiresAt?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'host' | 'admin' | 'guest';
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedEntityType?: 'property' | 'booking' | 'incident' | 'review';
  relatedEntityId?: string;
}

export interface Incident {
  id: string;
  propertyId: string;
  property?: Property;
  bookingId?: string;
  booking?: Booking;
  type: 'damage' | 'complaint' | 'maintenance' | 'safety' | 'noise' | 'cleanliness' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description: string;
  reportedBy: string;
  reportedByType: 'host' | 'guest' | 'admin' | 'neighbor';
  reportedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  estimatedCost?: number;
  actualCost?: number;
  images?: string[];
  notes?: IncidentNote[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentNote {
  id: string;
  incidentId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  isInternal: boolean;
}

export interface Financial {
  id: string;
  propertyId: string;
  property?: Property;
  bookingId?: string;
  booking?: Booking;
  type: 'revenue' | 'expense' | 'refund' | 'payout' | 'commission' | 'cleaning_fee' | 'maintenance';
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  propertyId: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  averageNightlyRate: number;
  occupancyRate: number;
  bookingCount: number;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
  };
  breakdown: {
    revenue: {
      bookings: number;
      cleaningFees: number;
      extras: number;
    };
    expenses: {
      maintenance: number;
      cleaning: number;
      utilities: number;
      commission: number;
      other: number;
    };
  };
}

export interface Review {
  id: string;
  propertyId: string;
  property?: Property;
  bookingId: string;
  booking?: Booking;
  guestId: string;
  guestName?: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  checkIn: number;
  value: number;
  comment: string;
  hostResponse?: string;
  hostRespondedAt?: string;
  status: 'pending' | 'published' | 'flagged' | 'hidden';
  createdAt: string;
  updatedAt: string;
  helpful: number;
  notHelpful: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userType: 'admin' | 'host' | 'system';
  action: string;
  entityType: 'property' | 'booking' | 'host' | 'approval' | 'incident' | 'financial' | 'review' | 'user';
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  description?: string;
}

export interface Host {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: Document[];
  propertyCount: number;
  rating?: number;
  reviewCount?: number;
  joinedAt: string;
  lastLoginAt?: string;
  bio?: string;
  languages?: string[];
  responseRate?: number;
  responseTime?: number;
  isSuperhost?: boolean;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  taxInfo?: {
    taxId: string;
    taxIdType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  totalProperties: number;
  activeProperties: number;
  suspendedProperties: number;
  pendingApprovals: number;
  totalHosts: number;
  activeHosts?: number;
  totalBookings?: number;
  totalRevenue: number;
  revenueChange: number;
  occupancyRate: number;
  occupancyChange: number;
  averageOccupancyRate?: number;
  averageRating: number;
  ratingChange: number;
  hostsChange: number;
  openIncidents?: number;
  criticalIncidents?: number;
  revenueGrowth?: number;
  bookingGrowth?: number;
  propertyGrowth?: number;
  currency?: string;
  period?: {
    startDate: string;
    endDate: string;
  };
  topPerformingProperties?: {
    propertyId: string;
    propertyName: string;
    revenue: number;
    bookings: number;
    rating: number;
  }[];
  recentActivities?: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export interface Booking {
  id: string;
  propertyId: string;
  property?: Property;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  nights: number;
  priceBreakdown: {
    basePrice: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
  };
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'host' | 'guest';
    name: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlockDatesRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  type?: 'maintenance' | 'owner_use' | 'seasonal' | 'manual' | 'other';
}

export interface SendNotificationRequest {
  recipientId: string;
  recipientType: 'host' | 'admin' | 'guest';
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface BulkNotificationRequest {
  recipientIds: string[];
  recipientType: 'host' | 'admin' | 'guest';
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CreateIncidentRequest {
  propertyId: string;
  bookingId?: string;
  type: 'damage' | 'complaint' | 'maintenance' | 'safety' | 'noise' | 'cleanliness' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reportedByType: 'host' | 'guest' | 'admin' | 'neighbor';
  estimatedCost?: number;
  images?: string[];
}

export interface UpdateIncidentRequest {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  actualCost?: number;
  notes?: string;
}

export interface UploadDocumentRequest {
  file: File;
  category: 'property_images' | 'property_documents' | 'host_documents' | 'verification' | 'legal' | 'other';
  description?: string;
  propertyId?: string;
  hostId?: string;
}
