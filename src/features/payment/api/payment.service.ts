import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const PaymentService = {
  async createSadadPayment(bookingId: string, customerEmail?: string, customerMobile?: string): Promise<ApiResponse> {
    return backendFetch('/api/sadadpayment/initiate', {
      method: 'POST',
      body: JSON.stringify({ bookingId, customerEmail, customerMobile }),
    });
  },

  async createPayPalOrderForBooking(bookingId: string, userId: string): Promise<ApiResponse> {
    return backendFetch('/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId, userId }),
    });
  },

  async capturePayPalOrder(orderId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/capture-order/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async getHostEarnings(hostId: string): Promise<ApiResponse> {
    return backendFetch(`/api/earnings?hostId=${hostId}`);
  },

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

  async verifySadadPayment(orderId: string): Promise<ApiResponse> {
    return backendFetch(`/api/sadadpayment/verify/${orderId}`);
  },
};
