// Basic API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  status?: number; // Added to match backend-api usage
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

// Auth types
export interface LoginRequest {
  email?: string;
  password?: string;
  phone?: string;
  code?: string; // For OTP or something
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Property types
export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  images: string[];
  rating?: number;
  reviews?: number;
  hostId: string;
  host?: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Location types
export interface Country {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  countryId: number;
}

// Booking types
export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  property?: Property;
}

export interface BookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface CreateBookingDto {
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  paymentMethod?: string;
}

// Trip type (similar to Booking but from guest perspective)
export interface Trip extends Booking {
  // Add trip specific fields if any
}

// Message types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  verified?: boolean;
  role?: string;
}

export interface ConnectedService {
  id: string;
  name: string;
  email: string | null;
  connected: boolean;
  icon: 'google' | 'facebook' | 'apple';
}
