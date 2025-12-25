import { backendFetch } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Property } from '@/types/api';

export const PropertyService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    hostId?: string;
    searchQuery?: string;
  }): Promise<ApiResponse<PaginatedResponse<Property>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.hostId) searchParams.set('hostId', params.hostId);
    if (params?.searchQuery) searchParams.set('searchQuery', params.searchQuery);

    const query = searchParams.toString();
    return backendFetch(`/api/properties${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<ApiResponse<Property>> => {
    return backendFetch(`/api/properties/${id}`);
  },

  search: async (params: {
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
  }): Promise<ApiResponse<PaginatedResponse<Property>>> => {
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

  approve: async (propertyId: string, adminId: string, notes?: string): Promise<ApiResponse> => {
    return backendFetch(`/inventory/properties/${propertyId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminId, notes }),
    });
  },

  reject: async (propertyId: string, adminId: string, reason: string, changesRequested?: string[]): Promise<ApiResponse> => {
    return backendFetch(`/inventory/properties/${propertyId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminId, reason, changesRequested }),
    });
  },

  create: async (data: {
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
    amenities?: string[];
    photos?: string[];
    [key: string]: any;
  }): Promise<ApiResponse<Property>> => {
    return backendFetch('/api/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (propertyId: string, data: Partial<Property>): Promise<ApiResponse<Property>> => {
    return backendFetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (propertyId: string): Promise<ApiResponse> => {
    return backendFetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
    });
  },
};
