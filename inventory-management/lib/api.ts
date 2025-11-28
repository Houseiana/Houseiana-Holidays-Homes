// API Client for Inventory Management System

import { getToken } from './auth';
import type {
  Property,
  Approval,
  BlockedDate,
  Document,
  Notification,
  Incident,
  Financial,
  FinancialSummary,
  Review,
  AuditLog,
  Host,
  KPI,
  Booking,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  BlockDatesRequest,
  SendNotificationRequest,
  BulkNotificationRequest,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  UploadDocumentRequest,
} from './types';

// API Configuration - Using Next.js API routes for direct database access
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * API Client Class for Inventory Management System
 * Handles all HTTP requests with authentication and error handling
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get default headers including authorization
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Generic request handler with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      // Handle different response status codes
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true } as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  private async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  /**
   * POST request
   */
  private async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  /**
   * PUT request
   */
  private async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  /**
   * PATCH request
   */
  private async patch<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  /**
   * DELETE request
   */
  private async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', credentials, false);
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/auth/logout');
  }

  // ============================================================================
  // PROPERTIES
  // ============================================================================

  /**
   * Get all properties with optional filters
   */
  async getProperties(params?: {
    page?: number;
    limit?: number;
    status?: string;
    hostId?: string;
    search?: string;
  }): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.hostId) queryParams.append('hostId', params.hostId);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<Property>>(
      `/properties${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get single property by ID
   */
  async getProperty(id: string): Promise<ApiResponse<Property>> {
    return this.get<ApiResponse<Property>>(`/properties/${id}`);
  }

  /**
   * Suspend a property
   */
  async suspendProperty(
    id: string,
    reason: string
  ): Promise<ApiResponse<Property>> {
    return this.patch<ApiResponse<Property>>(`/properties/${id}/suspend`, {
      reason,
    });
  }

  /**
   * Unsuspend a property
   */
  async unsuspendProperty(id: string): Promise<ApiResponse<Property>> {
    return this.patch<ApiResponse<Property>>(`/properties/${id}/unsuspend`);
  }

  /**
   * Soft delete a property
   */
  async softDeleteProperty(id: string): Promise<ApiResponse<Property>> {
    return this.delete<ApiResponse<Property>>(`/properties/${id}`);
  }

  /**
   * Restore a soft-deleted property
   */
  async restoreProperty(id: string): Promise<ApiResponse<Property>> {
    return this.patch<ApiResponse<Property>>(`/properties/${id}/restore`);
  }

  /**
   * Create a new property
   */
  async createProperty(data: Partial<Property>): Promise<ApiResponse<Property>> {
    return this.post<ApiResponse<Property>>('/properties', data);
  }

  /**
   * Update a property
   */
  async updateProperty(
    id: string,
    data: Partial<Property>
  ): Promise<ApiResponse<Property>> {
    return this.put<ApiResponse<Property>>(`/properties/${id}`, data);
  }

  // ============================================================================
  // APPROVALS
  // ============================================================================

  /**
   * Get all approvals with optional filters
   */
  async getApprovals(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<Approval>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<Approval>>(
      `/approvals${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get single approval by ID
   */
  async getApproval(id: string): Promise<ApiResponse<Approval>> {
    return this.get<ApiResponse<Approval>>(`/approvals/${id}`);
  }

  /**
   * Approve an approval request
   */
  async approveApproval(
    id: string,
    comments?: string
  ): Promise<ApiResponse<Approval>> {
    return this.patch<ApiResponse<Approval>>(`/approvals/${id}/approve`, {
      comments,
    });
  }

  /**
   * Reject an approval request
   */
  async rejectApproval(
    id: string,
    comments: string
  ): Promise<ApiResponse<Approval>> {
    return this.patch<ApiResponse<Approval>>(`/approvals/${id}/reject`, {
      comments,
    });
  }

  /**
   * Request changes for an approval
   */
  async requestChanges(
    id: string,
    changes: string[],
    comments?: string
  ): Promise<ApiResponse<Approval>> {
    return this.patch<ApiResponse<Approval>>(`/approvals/${id}/request-changes`, {
      changes,
      comments,
    });
  }

  // ============================================================================
  // CALENDAR / BLOCKED DATES
  // ============================================================================

  /**
   * Get blocked dates for a property
   */
  async getBlockedDates(
    propertyId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ApiResponse<BlockedDate[]>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.get<ApiResponse<BlockedDate[]>>(
      `/properties/${propertyId}/blocked-dates${query ? `?${query}` : ''}`
    );
  }

  /**
   * Block dates for a property
   */
  async blockDates(data: BlockDatesRequest): Promise<ApiResponse<BlockedDate>> {
    return this.post<ApiResponse<BlockedDate>>(
      `/properties/${data.propertyId}/blocked-dates`,
      data
    );
  }

  /**
   * Unblock dates (delete blocked date entry)
   */
  async unblockDates(
    propertyId: string,
    blockedDateId: string
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/properties/${propertyId}/blocked-dates/${blockedDateId}`
    );
  }

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  /**
   * Get documents for a property
   */
  async getPropertyDocuments(
    propertyId: string,
    category?: string
  ): Promise<ApiResponse<Document[]>> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    const query = queryParams.toString();
    return this.get<ApiResponse<Document[]>>(
      `/properties/${propertyId}/documents${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get documents for a host
   */
  async getHostDocuments(
    hostId: string,
    category?: string
  ): Promise<ApiResponse<Document[]>> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    const query = queryParams.toString();
    return this.get<ApiResponse<Document[]>>(
      `/hosts/${hostId}/documents${query ? `?${query}` : ''}`
    );
  }

  /**
   * Upload a document
   */
  async uploadDocument(
    file: File,
    data: Omit<UploadDocumentRequest, 'file'>
  ): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.propertyId) formData.append('propertyId', data.propertyId);
    if (data.hostId) formData.append('hostId', data.hostId);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/documents/${id}`);
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Send a notification
   */
  async sendNotification(
    data: SendNotificationRequest
  ): Promise<ApiResponse<Notification>> {
    return this.post<ApiResponse<Notification>>('/notifications/send', data);
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    data: BulkNotificationRequest
  ): Promise<ApiResponse<{ sent: number; failed: number }>> {
    return this.post<ApiResponse<{ sent: number; failed: number }>>(
      '/notifications/bulk-send',
      data
    );
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(params?: {
    page?: number;
    limit?: number;
    recipientId?: string;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.recipientId) queryParams.append('recipientId', params.recipientId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<Notification>>(
      `/notifications${query ? `?${query}` : ''}`
    );
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
  }

  // ============================================================================
  // INCIDENTS
  // ============================================================================

  /**
   * Get all incidents with optional filters
   */
  async getIncidents(params?: {
    page?: number;
    limit?: number;
    propertyId?: string;
    status?: string;
    severity?: string;
    type?: string;
  }): Promise<PaginatedResponse<Incident>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<Incident>>(
      `/incidents${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get single incident by ID
   */
  async getIncident(id: string): Promise<ApiResponse<Incident>> {
    return this.get<ApiResponse<Incident>>(`/incidents/${id}`);
  }

  /**
   * Create a new incident
   */
  async createIncident(
    data: CreateIncidentRequest
  ): Promise<ApiResponse<Incident>> {
    return this.post<ApiResponse<Incident>>('/incidents', data);
  }

  /**
   * Update an incident
   */
  async updateIncident(
    id: string,
    data: UpdateIncidentRequest
  ): Promise<ApiResponse<Incident>> {
    return this.patch<ApiResponse<Incident>>(`/incidents/${id}`, data);
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(
    id: string,
    resolution: string,
    actualCost?: number
  ): Promise<ApiResponse<Incident>> {
    return this.patch<ApiResponse<Incident>>(`/incidents/${id}/resolve`, {
      resolution,
      actualCost,
    });
  }

  /**
   * Add note to incident
   */
  async addIncidentNote(
    id: string,
    content: string,
    isInternal: boolean = false
  ): Promise<ApiResponse<Incident>> {
    return this.post<ApiResponse<Incident>>(`/incidents/${id}/notes`, {
      content,
      isInternal,
    });
  }

  // ============================================================================
  // FINANCIALS
  // ============================================================================

  /**
   * Get property financials
   */
  async getPropertyFinancials(
    propertyId: string,
    params?: { startDate?: string; endDate?: string; type?: string }
  ): Promise<ApiResponse<Financial[]>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return this.get<ApiResponse<Financial[]>>(
      `/properties/${propertyId}/financials${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get financial summary for a property
   */
  async getFinancialSummary(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<FinancialSummary>> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    return this.get<ApiResponse<FinancialSummary>>(
      `/properties/${propertyId}/financials/summary?${queryParams.toString()}`
    );
  }

  /**
   * Get bookings for a property
   */
  async getPropertyBookings(
    propertyId: string,
    params?: { startDate?: string; endDate?: string; status?: string }
  ): Promise<ApiResponse<Booking[]>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.get<ApiResponse<Booking[]>>(
      `/properties/${propertyId}/bookings${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get financial costs breakdown
   */
  async getFinancialCosts(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{ breakdown: Record<string, number> }>> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    return this.get<ApiResponse<{ breakdown: Record<string, number> }>>(
      `/properties/${propertyId}/financials/costs?${queryParams.toString()}`
    );
  }

  // ============================================================================
  // REVIEWS
  // ============================================================================

  /**
   * Get reviews for a property
   */
  async getPropertyReviews(
    propertyId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<PaginatedResponse<Review>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<Review>>(
      `/properties/${propertyId}/reviews${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get single review by ID
   */
  async getReview(id: string): Promise<ApiResponse<Review>> {
    return this.get<ApiResponse<Review>>(`/reviews/${id}`);
  }

  /**
   * Respond to a review
   */
  async respondToReview(
    id: string,
    response: string
  ): Promise<ApiResponse<Review>> {
    return this.patch<ApiResponse<Review>>(`/reviews/${id}/respond`, {
      response,
    });
  }

  /**
   * Flag a review
   */
  async flagReview(id: string, reason: string): Promise<ApiResponse<Review>> {
    return this.patch<ApiResponse<Review>>(`/reviews/${id}/flag`, { reason });
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  /**
   * Get audit logs with optional filters
   */
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.entityId) queryParams.append('entityId', params.entityId);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<AuditLog>>(
      `/audit-logs${query ? `?${query}` : ''}`
    );
  }

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(params?: {
    userId?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${this.baseUrl}/audit-logs/export${query ? `?${query}` : ''}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }

    return response.blob();
  }

  // ============================================================================
  // HOSTS
  // ============================================================================

  /**
   * Get all hosts with optional filters
   */
  async getHosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    verificationStatus?: string;
    search?: string;
  }): Promise<PaginatedResponse<Host>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.verificationStatus)
      queryParams.append('verificationStatus', params.verificationStatus);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.get<PaginatedResponse<Host>>(`/hosts${query ? `?${query}` : ''}`);
  }

  /**
   * Get single host by ID
   */
  async getHost(id: string): Promise<ApiResponse<Host>> {
    return this.get<ApiResponse<Host>>(`/hosts/${id}`);
  }

  /**
   * Update host information
   */
  async updateHost(id: string, data: Partial<Host>): Promise<ApiResponse<Host>> {
    return this.put<ApiResponse<Host>>(`/hosts/${id}`, data);
  }

  /**
   * Suspend a host
   */
  async suspendHost(id: string, reason: string): Promise<ApiResponse<Host>> {
    return this.patch<ApiResponse<Host>>(`/hosts/${id}/suspend`, { reason });
  }

  /**
   * Unsuspend a host
   */
  async unsuspendHost(id: string): Promise<ApiResponse<Host>> {
    return this.patch<ApiResponse<Host>>(`/hosts/${id}/unsuspend`);
  }

  /**
   * Verify a host
   */
  async verifyHost(id: string): Promise<ApiResponse<Host>> {
    return this.patch<ApiResponse<Host>>(`/hosts/${id}/verify`);
  }

  // ============================================================================
  // DASHBOARD / KPIs
  // ============================================================================

  /**
   * Get dashboard KPIs
   */
  async getDashboardKPIs(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<KPI>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.get<ApiResponse<KPI>>(`/dashboard/kpis${query ? `?${query}` : ''}`);
  }

  /**
   * Get top performing properties
   */
  async getTopPerformingProperties(
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<
    ApiResponse<
      {
        propertyId: string;
        propertyName: string;
        revenue: number;
        bookings: number;
        rating: number;
      }[]
    >
  > {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return this.get<
      ApiResponse<
        {
          propertyId: string;
          propertyName: string;
          revenue: number;
          bookings: number;
          rating: number;
        }[]
      >
    >(`/dashboard/top-properties?${queryParams.toString()}`);
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(
    limit: number = 20
  ): Promise<
    ApiResponse<{ type: string; description: string; timestamp: string }[]>
  > {
    return this.get<
      ApiResponse<{ type: string; description: string; timestamp: string }[]>
    >(`/dashboard/recent-activities?limit=${limit}`);
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;

// Also export the class for testing or custom instances
export { api, ApiClient };
