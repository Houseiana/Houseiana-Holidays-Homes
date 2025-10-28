/**
 * Railway Backend API Client
 *
 * This module provides a unified interface to communicate with the C# backend
 * deployed on Railway. It extends the base API client with Railway-specific
 * functionality and error handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Get Railway backend URL from environment variables
const RAILWAY_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000/api/v1.0';

// Log the configured API URL (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🚂 Railway API configured:', RAILWAY_API_URL);
}

export interface RailwayApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[] | Record<string, string[]>;
  timestamp?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  isHost: boolean;
  isGuest: boolean;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  kycCompleted?: boolean;
}

class RailwayApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: RAILWAY_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 second timeout
      withCredentials: false, // Set to true if using cookies
    });

    // Load auth token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Add authorization header if token exists
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Log request details in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 Railway API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Railway API Response: ${response.status}`, response.data);
        }
        return response;
      },
      (error: AxiosError<RailwayApiResponse>) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Handle API errors with detailed logging and user-friendly messages
   */
  private handleError(error: AxiosError<RailwayApiResponse>): Promise<never> {
    let errorMessage = 'An unexpected error occurred';
    let errorDetails: any = null;

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      console.error(`❌ Railway API Error [${status}]:`, data);

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Invalid request';
          errorDetails = data?.errors;
          break;
        case 401:
          errorMessage = 'Unauthorized - Please login again';
          this.clearAuth();
          if (typeof window !== 'undefined') {
            // Optionally redirect to login
            // window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = data?.message || 'Resource not found';
          break;
        case 422:
          errorMessage = 'Validation failed';
          errorDetails = data?.errors;
          break;
        case 500:
          errorMessage = 'Server error - Please try again later';
          break;
        case 503:
          errorMessage = 'Service unavailable - Railway backend might be down';
          break;
        default:
          errorMessage = data?.message || `Error ${status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No response from Railway backend:', error.request);
      errorMessage = 'Cannot connect to server - Please check your internet connection';
    } else {
      // Error in request configuration
      console.error('❌ Request setup error:', error.message);
      errorMessage = error.message;
    }

    const customError: any = new Error(errorMessage);
    customError.details = errorDetails;
    customError.status = error.response?.status;

    return Promise.reject(customError);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Generic HTTP methods
   */
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  // ============================================================================
  // Authentication Endpoints
  // ============================================================================

  /**
   * Register a new user
   */
  async register(data: {
    email?: string;
    phoneNumber?: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RailwayApiResponse<{ user: User; token: string }>> {
    const response = await this.post<RailwayApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      data
    );

    if (response.data?.token) {
      this.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  /**
   * Login with email/phone and password
   */
  async login(data: {
    email?: string;
    phoneNumber?: string;
    password: string;
  }): Promise<RailwayApiResponse<{ user: User; token: string }>> {
    const response = await this.post<RailwayApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      data
    );

    if (response.data?.token) {
      this.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<RailwayApiResponse<User>> {
    return this.get<RailwayApiResponse<User>>('/auth/me');
  }

  // ============================================================================
  // Properties Endpoints
  // ============================================================================

  /**
   * Get all properties with filters
   */
  async getProperties(params?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<RailwayApiResponse<any>> {
    return this.get('/properties', { params });
  }

  /**
   * Get property by ID
   */
  async getProperty(id: string): Promise<RailwayApiResponse<any>> {
    return this.get(`/properties/${id}`);
  }

  /**
   * Create a new property (host only)
   */
  async createProperty(data: any): Promise<RailwayApiResponse<any>> {
    return this.post('/properties', data);
  }

  /**
   * Update property (host only)
   */
  async updateProperty(id: string, data: any): Promise<RailwayApiResponse<any>> {
    return this.put(`/properties/${id}`, data);
  }

  /**
   * Delete property (host only)
   */
  async deleteProperty(id: string): Promise<RailwayApiResponse<any>> {
    return this.delete(`/properties/${id}`);
  }

  // ============================================================================
  // Bookings Endpoints
  // ============================================================================

  /**
   * Get all bookings for current user
   */
  async getBookings(params?: {
    role?: 'guest' | 'host';
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<RailwayApiResponse<any>> {
    return this.get('/bookings', { params });
  }

  /**
   * Get booking by ID
   */
  async getBooking(id: string): Promise<RailwayApiResponse<any>> {
    return this.get(`/bookings/${id}`);
  }

  /**
   * Create a new booking
   */
  async createBooking(data: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    adults?: number;
    children?: number;
    infants?: number;
    specialRequests?: string;
  }): Promise<RailwayApiResponse<any>> {
    return this.post('/bookings', data);
  }

  /**
   * Update booking status
   */
  async updateBooking(id: string, data: { status: string }): Promise<RailwayApiResponse<any>> {
    return this.patch(`/bookings/${id}`, data);
  }

  // ============================================================================
  // Payments Endpoints
  // ============================================================================

  /**
   * Create payment intent for booking
   */
  async createPaymentIntent(bookingId: string): Promise<RailwayApiResponse<any>> {
    return this.post('/payments/create-intent', { bookingId });
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId: string): Promise<RailwayApiResponse<any>> {
    return this.post(`/payments/${paymentId}/confirm`);
  }

  // ============================================================================
  // Messages Endpoints
  // ============================================================================

  /**
   * Get all conversations
   */
  async getConversations(): Promise<RailwayApiResponse<any>> {
    return this.get('/messages/conversations');
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string, params?: { page?: number; pageSize?: number }): Promise<RailwayApiResponse<any>> {
    return this.get(`/messages/conversations/${conversationId}/messages`, { params });
  }

  /**
   * Send a message
   */
  async sendMessage(data: {
    conversationId?: string;
    recipientId?: string;
    message: string;
  }): Promise<RailwayApiResponse<any>> {
    return this.post('/messages/send', data);
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  /**
   * Check if Railway backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.error('Railway backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const railwayApi = new RailwayApiClient();

// Export utility functions
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

export const getCurrentUserData = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userString = localStorage.getItem('auth_user');
  return userString ? JSON.parse(userString) : null;
};

export default railwayApi;
