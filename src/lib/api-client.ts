/**
 * Base API Client
 */

import { ApiResponse } from '@/types/api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

/**
 * Base fetch function with error handling
 */
export async function backendFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_API_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };


    // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  // If body is FormData, let the browser set Content-Type
  // (it needs to set the boundary)
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
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
 * API Client wrapper for common HTTP methods
 * Compatible with legacy usages expecting apiClient.get/post/etc.
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    backendFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    backendFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
    
  put: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    backendFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
    
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    backendFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: <T>(endpoint: string, options?: RequestInit) => 
    backendFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
