import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const SupportService = {
  async getUserTickets(userId: string): Promise<ApiResponse<{
    summary: any;
    tickets: any[];
    categories: any[];
  }>> {
    return backendFetch(`/api/support?userId=${userId}`);
  },

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
