import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const InventoryService = {
  async getDashboardKPIs(startDate?: Date, endDate?: Date): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate.toISOString());
    if (endDate) params.set('endDate', endDate.toISOString());

    const query = params.toString();
    return backendFetch(`/inventory/dashboard/kpis${query ? `?${query}` : ''}`);
  },

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

  async login(email: string, password: string): Promise<ApiResponse> {
    return backendFetch('/inventory/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};
