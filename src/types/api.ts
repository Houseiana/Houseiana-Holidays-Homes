// Basic API Response types
export interface ApiResponse<T = any> {
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

export interface CreateBookingDto {
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  paymentMethod?: string;
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
