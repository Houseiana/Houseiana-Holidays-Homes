/**
 * Backend API Client
 *
 * Centralized client for communicating with the .NET Backend API.
 * All database operations should go through this client instead of direct Prisma calls.
 *
 * Security: Database credentials are only stored in the backend, not in the frontend.
 */

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

// Types
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

/**
 * Base fetch function with error handling
 */
async function backendFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_API_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;
  const defaultHeaders: HeadersInit = isFormData ? {} : {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`Backend API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Property API
 */
export const PropertyAPI = {
  // ... (previous methods remain unchanged)

  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    hostId?: string;
    searchQuery?: string;
  }): Promise<ApiResponse<PaginatedResponse<Property>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.hostId) searchParams.set('hostId', params.hostId);
    if (params?.searchQuery) searchParams.set('searchQuery', params.searchQuery);

    const query = searchParams.toString();
    return backendFetch(`/api/properties${query ? `?${query}` : ''}`);
  },

  /**
   * Get property by ID
   * Endpoint: GET /api/properties/{id}
   */
  async getById(id: string): Promise<ApiResponse<Property>> {
    return backendFetch(`/api/properties/${id}`);
  },

  async getPropertyById(id: string): Promise<ApiResponse<Property>> {
    return backendFetch(`/api/property-search/${id}`);
  },

  /**
   * Search properties with filters
   * Endpoint: GET /api/properties (same as getAll but with search params)
   */
  async search(params: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    amenities?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Property>>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    });

    return backendFetch(`/api/properties?${searchParams.toString()}`);
  },

  /**
   * Public property search
   * Endpoint: GET /api/property-search
   */
  async publicSearch(params: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number; // in km
    searchQuery?: string;
    propertyType?: string;
    userId?: string;
  }): Promise<ApiResponse<{ properties: any[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.latitude) searchParams.set('latitude', params.latitude.toString());
    if (params.longitude) searchParams.set('longitude', params.longitude.toString());
    if (params.radius) searchParams.set('radius', params.radius.toString());
    if (params.searchQuery) searchParams.set('searchQuery', params.searchQuery);
    if (params.propertyType && params.propertyType !== 'all') searchParams.set('propertyType', params.propertyType);
    if (params.userId) searchParams.set('userId', params.userId.toString());

    const query = searchParams.toString();
    return backendFetch(`/api/property-search/search?${query}`);
  },

  /**
   * Public property search
   * Endpoint: GET /api/property-search
   */
  async publicSearchFilter(params: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number; // in km
    searchQuery?: string;
    propertyType?: string;
    userId?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    adults?: number;
    children?: number;
    infants?: number;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
    minRating?: number;
    amenities?: string[];
  }): Promise<ApiResponse<{ properties: any[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.latitude) searchParams.set('latitude', params.latitude.toString());
    if (params.longitude) searchParams.set('longitude', params.longitude.toString());
    if (params.radius) searchParams.set('radius', params.radius.toString());
    if (params.searchQuery) searchParams.set('searchQuery', params.searchQuery);
    if (params.propertyType && params.propertyType !== 'all') searchParams.set('propertyType', params.propertyType);
    if (params.userId) searchParams.set('userId', params.userId.toString());
    if (params.location) searchParams.set('location', params.location);
    if (params.checkIn) searchParams.set('checkIn', params.checkIn);
    if (params.checkOut) searchParams.set('checkOut', params.checkOut);
    if (params.guests) searchParams.set('guests', params.guests.toString());
    if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.bedrooms) searchParams.set('bedrooms', params.bedrooms.toString());
    if (params.beds) searchParams.set('beds', params.beds.toString());
    if (params.bathrooms) searchParams.set('bathrooms', params.bathrooms.toString());
    if (params.minRating) searchParams.set('minRating', params.minRating.toString());
    if (params.amenities && params.amenities.length > 0) {
      params.amenities.forEach(a => searchParams.append('amenities', a));
    }

    const query = searchParams.toString();
    return backendFetch(`/api/property-search?${query}`);
  },

  /**
   * Get booked dates for a property
   * Endpoint: GET /api/property-search/{id}/booked-dates
   */
  async getBookedDates(propertyId: string): Promise<ApiResponse<{ booked_Ranges: { from: string; to: string }[] }>> {
    return backendFetch(`/api/property-search/${propertyId}/booked-dates`);
  },

  /**
   * Approve property (admin)
   * Endpoint: POST /inventory/properties/{id}/approve
   */
  async approve(propertyId: string, adminId: string, notes?: string): Promise<ApiResponse> {
    return backendFetch(`/inventory/properties/${propertyId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminId, notes }),
    });
  },

  /**
   * Reject property (admin)
   * Endpoint: POST /inventory/properties/{id}/reject
   */
  async reject(propertyId: string, adminId: string, reason: string, changesRequested?: string[]): Promise<ApiResponse> {
    return backendFetch(`/inventory/properties/${propertyId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminId, reason, changesRequested }),
    });
  },

  /**
   * Create a new property
   * Endpoint: POST /api/properties
   */
  async create(data: FormData | {
    hostId: string;
    title: string;
    description: string;
    propertyType: string;
    country: string;
    city: string;
    address: string;
    pricePerNight: number;
    guests?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: number[];
    safetyItem?: number[];
    guestFavorites?: number[];
    propertyHighlight?: number[];
    photos?: string[];
    [key: string]: any;
  }, token?: string): Promise<ApiResponse<Property>> {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return backendFetch('/api/properties', {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Update a property
   * Endpoint: PUT /api/properties/{id}
   */
  async update(propertyId: string, data: Partial<Property>): Promise<ApiResponse<Property>> {
    return backendFetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a property
   * Endpoint: DELETE /api/properties/{id}
   */
  async delete(propertyId: string): Promise<ApiResponse> {
    return backendFetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Booking API
 */
export const BookingAPI = {
  /**
   * Create a new booking
   */
  async create(dto: CreateBookingDto): Promise<ApiResponse<Booking>> {
    return backendFetch('/booking-manager', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Get booking by ID
   */
  async getById(id: string): Promise<ApiResponse<Booking>> {
    return backendFetch(`/booking-manager/${id}`);
  },

  /**
   * Get bookings for a user
   */
  async getUserBookings(userId: string, role: 'guest' | 'host' = 'guest'): Promise<ApiResponse<Booking[]>> {
    return backendFetch(`/booking-manager/user/${userId}?role=${role}`);
  },

  /**
   * Confirm booking after payment
   */
  async confirm(bookingId: string): Promise<ApiResponse<Booking>> {
    return backendFetch(`/booking-manager/${bookingId}/confirm`, {
      method: 'POST',
    });
  },

  /**
   * Approve booking (host)
   */
  async approve(bookingId: string, hostId: string): Promise<ApiResponse<Booking>> {
    return backendFetch(`/booking-manager/${bookingId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ hostId }),
    });
  },

  /**
   * Reject booking (host)
   */
  async reject(bookingId: string, hostId: string, reason?: string): Promise<ApiResponse<Booking>> {
    return backendFetch(`/booking-manager/${bookingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ hostId, reason }),
    });
  },

  /**
   * Cancel booking
   */
  async cancel(bookingId: string, userId: string, reason?: string): Promise<ApiResponse<Booking>> {
    return backendFetch(`/booking-manager/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    });
  },

  /**
   * Get guest trips
   */
  async getGuestTrips(filter: 'upcoming' | 'past' | 'cancelled'): Promise<ApiResponse<any>> {
    return backendFetch(`/api/guest/trips?filter=${filter}`);
  },
};

/**
 * User API
 */
export const UserAPI = {
  /**
   * Get user by ID
   */
  async getById(id: string): Promise<ApiResponse<User>> {
    return backendFetch(`/users/${id}`);
  },

  /**
   * Toggle favorite
   */
  async toggleFavorite(userId: string, propertyId: string): Promise<ApiResponse> {
    return backendFetch('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ userId, propertyId }),
    });
  },
};

/**
 * Payment API
 */
export const PaymentAPI = {
  /**
   * Create Sadad payment
   * Endpoint: POST /users/sadad/payment
   */
  async createSadadPayment(data: {
    amount: number;
    orderId: string;
    email: string;
    mobileNo: string;
    description: string;
  }): Promise<ApiResponse> {
    return backendFetch('/users/sadad/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create PayPal order for booking
   * Backend validates booking ownership and creates payment record
   * Endpoint: POST /create-order
   */
  async createPayPalOrderForBooking(orderId: string,  amount: number): Promise<ApiResponse> {
    return backendFetch('/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount }),
    });
  },

  /**
   * Capture PayPal order
   * Backend handles payment capture, booking update, and transaction creation
   * Endpoint: POST /capture-order/{orderId}
   */
  async capturePayPalOrder(orderId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/capture-order/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Get host earnings and payouts
   */
  async getHostEarnings(hostId: string): Promise<ApiResponse> {
    return backendFetch(`/api/earnings?hostId=${hostId}`);
  },

  /**
   * Handle Sadad payment callback
   * Backend processes payment result and updates booking status
   * Endpoint: POST /api/sadadpayment/callback
   */
  async handleSadadCallback(data: {
    orderId: string;
    txnId?: string;
    status: string;
    bankTxnId?: string;
    txnAmount?: string;
    respMsg?: string;
  }): Promise<ApiResponse> {
    return backendFetch('/api/sadadpayment/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify Sadad payment status
   * Endpoint: GET /api/sadadpayment/verify/{orderId}
   */
  async verifySadadPayment(orderId: string): Promise<ApiResponse> {
    return backendFetch(`/api/sadadpayment/verify/${orderId}`);
  },
};

/**
 * Inventory/Admin API
 */
export const InventoryAPI = {
  /**
   * Get dashboard KPIs
   */
  async getDashboardKPIs(startDate?: Date, endDate?: Date): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate.toISOString());
    if (endDate) params.set('endDate', endDate.toISOString());

    const query = params.toString();
    return backendFetch(`/inventory/dashboard/kpis${query ? `?${query}` : ''}`);
  },

  /**
   * Get pending approvals
   */
  async getPendingApprovals(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return backendFetch(`/inventory/approvals/pending${query ? `?${query}` : ''}`);
  },

  /**
   * Admin login
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    return backendFetch('/inventory/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

/**
 * Messaging API
 * For real-time chat between guests and hosts
 */
export const MessagingAPI = {
  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<ApiResponse<any>> {
    return backendFetch(`/api/conversations/${conversationId}`);
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    senderRole: 'guest' | 'host';
  }): Promise<ApiResponse<any>> {
    return backendFetch(`/api/conversations/${data.conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Mark message as read
   */
  async markAsRead(conversationId: string, messageId: string): Promise<ApiResponse<any>> {
    return backendFetch(`/api/conversations/${conversationId}/messages/${messageId}/read`, {
      method: 'POST',
    });
  },

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string): Promise<ApiResponse<any[]>> {
    return backendFetch(`/api/conversations?userId=${userId}`);
  },
};

/**
 * Webhook API
 * For handling payment gateway webhooks
 */
export const WebhookAPI = {
  /**
   * Handle Stripe webhook events
   * Forwards raw body and signature to backend for verification
   */
  async handleStripeWebhook(data: {
    rawBody: string;
    signature: string;
  }): Promise<ApiResponse> {
    return backendFetch('/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Handle PayPal webhook events
   */
  async handlePayPalWebhook(event: {
    event_type: string;
    resource: any;
  }): Promise<ApiResponse> {
    return backendFetch('/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },
};

/**
 * Cron API
 * For scheduled job endpoints
 */
export const CronAPI = {
  /**
   * Cleanup expired bookings (AWAITING_PAYMENT with expired holds)
   */
  async cleanupExpiredBookings(cronSecret?: string): Promise<ApiResponse> {
    return backendFetch('/api/cron/cleanup-bookings', {
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });
  },

  /**
   * Expire bookings with expired holds
   */
  async expireBookings(cronSecret?: string): Promise<ApiResponse> {
    return backendFetch('/api/cron/expire-bookings', {
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });
  },
};

/**
 * Favorites API
 */
export const FavoritesAPI = {
  /**
   * Get user's favorite properties
   */
  async getUserFavorites(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ properties: any[], pagination: any }>> {
    return backendFetch(`/users/${userId}/favorites?page=${page}&limit=${limit}`);
  },

  /**
   * Add property to favorites
   */
  async addFavorite(userId: string, propertyId: string): Promise<ApiResponse> {
    return backendFetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ userId, propertyId }),
    });
  },

  /**
   * Remove property from favorites
   */
  async removeFavorite(favoriteId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/api/favorites/${favoriteId}?userId=${userId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Trips API
 */
export const TripsAPI = {
  /**
   * Get user's trips (upcoming and past bookings)
   */
  async getUserTrips(userId: string): Promise<ApiResponse<{
    summary: any;
    upcoming: any[];
    past: any[];
  }>> {
    return backendFetch(`/api/trips?userId=${userId}`);
  },
};

/**
 * Payment Methods API
 */
export const PaymentMethodsAPI = {
  /**
   * Get user's payment methods
   */
  async getUserPaymentMethods(userId: string): Promise<ApiResponse<any[]>> {
    return backendFetch(`/api/payment-methods?userId=${userId}`);
  },

  /**
   * Add payment method
   */
  async addPaymentMethod(userId: string, paymentMethodId: string): Promise<ApiResponse> {
    return backendFetch('/api/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ userId, paymentMethodId }),
    });
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/api/payment-methods/${methodId}?userId=${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/api/payment-methods/${methodId}/set-default`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Get user's payment history and summary
   */
  async getPaymentHistory(userId: string): Promise<ApiResponse<{
    summary: any;
    upcomingCharges: any[];
    methods: any[];
    history: any[];
  }>> {
    return backendFetch(`/api/payments?userId=${userId}`);
  },
};

/**
 * Lookups API
 */
export const LookupsAPI = {
  /**
   * Get property types
   * Endpoint: GET /api/Lookups/PropertyType
   */
  async getPropertyTypes(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/PropertyType');
  },

  /**
   * Get genders
   * Endpoint: GET /api/Lookups/Gender
   */
  async getGenders(): Promise<ApiResponse<any>> {
    return backendFetch('/api/Lookups/Gender');
  },

  /**
   * Get guest favorites amenities
   * Endpoint: GET /api/Lookups/GuestFavorites
   */
  async getGuestFavorites(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/GuestFavorites');
  },

  /**
   * Get standout amenities
   * Endpoint: GET /api/Lookups/StandoutAmenities
   */
  async getStandoutAmenities(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/StandoutAmenities');
  },

  /**
   * Get safety items
   * Endpoint: GET /api/Lookups/SafetyItems
   */
  async getSafetyItems(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/SafetyItems');
  },

  /**
   * Get property highlights
   * Endpoint: GET /api/Lookups/PropertyHighlight
   */
  async getPropertyHighlights(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/PropertyHighlight');
  },

  /**
   * Get booking display status
   * Endpoint: GET /api/Lookups/BookingDisplayStatus
   */
  async getBookingDisplayStatus(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/BookingDisplayStatus');
  },

  /**
   * Get reason for blocking property
   * Endpoint: GET /api/Lookups/ReasonBlockProperty
   */
  async getReasonBlockProperty(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/ReasonBlockProperty');
  },

  /**
   * Get countries
   * Endpoint: GET /api/Lookups/country
   */
  async getCountries(): Promise<ApiResponse<any[]>> {
    return backendFetch('/api/Lookups/country');
  },

  /**
   * Get cities by country ID
   * Endpoint: GET /api/Lookups/cities?countryId={countryId}
   */
  async getCities(countryId: string | number): Promise<ApiResponse<any[]>> {
    return backendFetch(`/api/Lookups/cities?countryId=${countryId}`);
  },
};

/**
 * Support API
 */
export const SupportAPI = {
  /**
   * Get user's support tickets
   */
  async getUserTickets(userId: string): Promise<ApiResponse<{
    summary: any;
    tickets: any[];
    categories: any[];
  }>> {
    return backendFetch(`/api/support?userId=${userId}`);
  },

  /**
   * Create support ticket
   */
  async createTicket(data: {
    userId: string;
    category: string;
    subject: string;
    message: string;
    priority?: string;
    bookingId?: string;
  }): Promise<ApiResponse> {
    return backendFetch('/api/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Extended Booking API
 */
export const BookingExtendedAPI = {
  /**
   * Verify booking payment status
   */
  async verifyPayment(bookingId: string): Promise<ApiResponse> {
    return backendFetch(`/api/bookings/verify?id=${bookingId}`);
  },

  /**
   * Pay remaining balance for split payment bookings
   */
  async payBalance(bookingId: string, userId: string, paymentProvider: string): Promise<ApiResponse> {
    return backendFetch('/api/bookings/pay-balance', {
      method: 'POST',
      body: JSON.stringify({ bookingId, userId, paymentProvider }),
    });
  },
};

/**
 * Audit API
 * For logging system events to backend
 */
export const AuditAPI = {
  /**
   * Create an audit log entry
   */
  async createLog(entry: {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    actorType: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse> {
    return backendFetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};

// Default export for convenience
const BackendAPI = {
  Property: PropertyAPI,
  Booking: BookingAPI,
  BookingExtended: BookingExtendedAPI,
  User: UserAPI,
  Payment: PaymentAPI,
  PaymentMethods: PaymentMethodsAPI,
  Lookups: LookupsAPI,
  Inventory: InventoryAPI,
  Messaging: MessagingAPI,
  Webhook: WebhookAPI,
  Cron: CronAPI,
  Favorites: FavoritesAPI,
  Trips: TripsAPI,
  Support: SupportAPI,
  Audit: AuditAPI,
};

export default BackendAPI;
