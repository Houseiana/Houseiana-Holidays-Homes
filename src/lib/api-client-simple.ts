import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1.0';

// Simple types for C# backend communication
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - remove token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.client.post('/Auth/login', credentials);
    const authData = response.data;

    // Store token
    if (typeof window !== 'undefined' && authData.token) {
      localStorage.setItem('auth_token', authData.token);
    }

    return authData;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post('/Auth/register', userData);
    const authData = response.data;

    // Store token
    if (typeof window !== 'undefined' && authData.token) {
      localStorage.setItem('auth_token', authData.token);
    }

    return authData;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/Auth/health');
    return response.data;
  }

  // Properties endpoints (basic structure)
  async getProperties(params?: { page?: number; pageSize?: number }) {
    const response = await this.client.get('/Property', { params });
    return response.data;
  }

  async getProperty(id: string) {
    const response = await this.client.get(`/Property/${id}`);
    return response.data;
  }

  // Bookings endpoints (basic structure)
  async getBookings(params?: { page?: number; pageSize?: number }) {
    const response = await this.client.get('/Booking', { params });
    return response.data;
  }

  async getBooking(id: string) {
    const response = await this.client.get(`/Booking/${id}`);
    return response.data;
  }

  // Notifications endpoints
  async getNotifications(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
    const response = await this.client.get('/Notification', { params });
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.client.put(`/Notification/${id}/read`);
    return response.data;
  }

  // Reviews endpoints
  async getPropertyReviews(propertyId: string, params?: { page?: number; pageSize?: number }) {
    const response = await this.client.get(`/Review/property/${propertyId}`, { params });
    return response.data;
  }

  // Saved Properties endpoints
  async getSavedProperties(params?: { page?: number; pageSize?: number }) {
    const response = await this.client.get('/SavedProperty', { params });
    return response.data;
  }

  async saveProperty(propertyId: string, listName?: string, notes?: string) {
    const response = await this.client.post('/SavedProperty', {
      propertyId,
      listName,
      notes
    });
    return response.data;
  }

  async unsaveProperty(propertyId: string) {
    const response = await this.client.delete(`/SavedProperty/property/${propertyId}`);
    return response.data;
  }

  // Payment Methods endpoints
  async getPaymentMethods() {
    const response = await this.client.get('/PaymentMethod');
    return response.data;
  }

  async addPaymentMethod(paymentMethodData: any) {
    const response = await this.client.post('/PaymentMethod', paymentMethodData);
    return response.data;
  }

  async deletePaymentMethod(id: string) {
    const response = await this.client.delete(`/PaymentMethod/${id}`);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;