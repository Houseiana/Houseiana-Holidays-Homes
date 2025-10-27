import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1.0';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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
        console.error('API Error:', error);

        let errorMessage = 'An unexpected error occurred';

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(endpoint, config);
    return response.data;
  }

  async getPaginated<T>(endpoint: string, config?: AxiosRequestConfig): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(endpoint, config);
    return response.data;
  }

  // Houseiana-specific API methods

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Properties methods
  async getProperties(params?: {
    location?: string;
    checkin?: string;
    checkout?: string;
    guests?: number;
    propertyType?: string;
    priceMin?: number;
    priceMax?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/properties', { params });
    return response.data;
  }

  async getProperty(id: string): Promise<Property> {
    const response = await this.client.get<Property>(`/properties/${id}`);
    return response.data;
  }

  async createProperty(propertyData: CreatePropertyRequest): Promise<Property> {
    const response = await this.client.post<Property>('/properties', propertyData);
    return response.data;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const response = await this.client.put<Property>(`/properties/${id}`, updates);
    return response.data;
  }

  // Bookings methods
  async getBookings(params?: {
    role?: 'guest' | 'host';
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/bookings', { params });
    return response.data;
  }

  async createBooking(bookingData: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    adults: number;
    children?: number;
    infants?: number;
    specialRequests?: string;
  }): Promise<Booking> {
    const response = await this.client.post<Booking>('/bookings', bookingData);
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  // Payments methods
  async createPaymentIntent(bookingId: string) {
    const response = await this.client.post('/payments/create-intent', { bookingId });
    return response.data;
  }

  // Messages methods
  async getConversations() {
    const response = await this.client.get('/messages/conversations');
    return response.data;
  }

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await this.client.post<Conversation>('/messages/conversations', data);
    return response.data;
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const response = await this.client.get(`/messages/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  }

  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await this.client.post<Message>('/messages/send', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// Utility functions
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

export const handleApiError = (error: any) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
