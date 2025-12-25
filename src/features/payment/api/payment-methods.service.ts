import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const PaymentMethodsService = {
  async getUserPaymentMethods(userId: string): Promise<ApiResponse<any[]>> {
    return backendFetch(`/api/payment-methods?userId=${userId}`);
  },

  async addPaymentMethod(userId: string, paymentMethodId: string): Promise<ApiResponse> {
    return backendFetch('/api/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ userId, paymentMethodId }),
    });
  },

  async deletePaymentMethod(methodId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/api/payment-methods/${methodId}?userId=${userId}`, {
      method: 'DELETE',
    });
  },

  async setDefaultPaymentMethod(methodId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/api/payment-methods/${methodId}/set-default`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  },

  async getPaymentHistory(userId: string): Promise<ApiResponse<{
    summary: any;
    upcomingCharges: any[];
    methods: any[];
    history: any[];
  }>> {
    return backendFetch(`/api/payments?userId=${userId}`);
  },
};
