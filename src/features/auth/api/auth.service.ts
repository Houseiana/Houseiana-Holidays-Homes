import { ApiResponse, PaginatedResponse, User, ConnectedService } from '@/types/api';

import { backendFetch } from '@/lib/api-client';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

export const UserService = {
  getById: async (id: string): Promise<ApiResponse<User>> => {
    return backendFetch(`/users/${id}`);
  },
};

export const AccountService = {
  getSessions: async () => {
    return backendFetch<any>('/api/account/sessions');
  },

  revokeSession: async (sessionId: string) => {
    return backendFetch(`/api/account/sessions?sessionId=${sessionId}`, {
      method: 'DELETE',
    });
  },

  revokeAllOtherSessions: async () => {
    return backendFetch('/api/account/sessions?all=true', {
      method: 'DELETE',
    });
  },

  deactivateAccount: async (reason?: string) => {
    return backendFetch('/api/account/deactivate', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getProfile: async () => {
    const response = await backendFetch<any>('/api/account/profile');
    return { ...response, data: response.data?.data };
  },

  updateProfile: async (field: string, data: Record<string, any>) => {
    return backendFetch<any>('/api/account/profile', {
      method: 'PATCH',
      body: JSON.stringify({ field, data }),
    });
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const response = await backendFetch<any>('/api/account/payment-methods');
    return { ...response, data: response.data?.data };
  },

  addPaymentMethod: async (data: {
    cardNumber: string;
    expiry: string;
    cardholderName: string;
    billingAddress?: { street: string; city: string; postalCode: string; country: string };
    isDefault?: boolean;
  }) => {
    const response = await backendFetch<any>('/api/account/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ...response, data: response.data?.data };
  },

  deletePaymentMethod: async (id: string) => {
    return backendFetch(`/api/account/payment-methods?id=${id}`, {
      method: 'DELETE',
    });
  },

  setDefaultPaymentMethod: async (id: string) => {
    return backendFetch('/api/account/payment-methods', {
      method: 'PATCH',
      body: JSON.stringify({ id, setDefault: true }),
    });
  },

  // Payout Methods
  getPayoutMethods: async () => {
    const response = await backendFetch<any>('/api/account/payout-methods');
    return { ...response, data: response.data?.data };
  },

  addPayoutMethod: async (data: {
    payoutType: 'bank' | 'paypal';
    country: string;
    accountHolderName: string;
    iban?: string;
    paypalEmail?: string;
    isDefault?: boolean;
  }) => {
    const response = await backendFetch<any>('/api/account/payout-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ...response, data: response.data?.data };
  },

  deletePayoutMethod: async (id: string) => {
    return backendFetch(`/api/account/payout-methods?id=${id}`, {
      method: 'DELETE',
    });
  },

  setDefaultPayoutMethod: async (id: string) => {
    return backendFetch('/api/account/payout-methods', {
      method: 'PATCH',
      body: JSON.stringify({ id, setDefault: true }),
    });
  },

  // Payments History
  getPayments: async (page = 1, limit = 10) => {
    return backendFetch<any>(`/api/account/payments?page=${page}&limit=${limit}`);
  },

  exportPayments: async (format = 'csv', startDate?: string, endDate?: string) => {
    // Handling blob for CSV might need custom fetch because backendFetch expects JSON
    const url = `${BACKEND_API_URL}/api/account/payments`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format, startDate, endDate }),
        });
        if (format === 'csv' && response.ok) {
            const blob = await response.blob();
            return { success: true, data: blob };
        }
        const data = await response.json();
        return { success: response.ok, data, error: !response.ok ? data.error : undefined };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
  },

  // Payouts History
  getPayouts: async (page = 1, limit = 10) => {
    return backendFetch<any>(`/api/account/payouts?page=${page}&limit=${limit}`);
  },

  exportPayouts: async (format = 'csv', startDate?: string, endDate?: string) => {
     const url = `${BACKEND_API_URL}/api/account/payouts`;
     try {
         const response = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ format, startDate, endDate }),
         });
         if (format === 'csv' && response.ok) {
             const blob = await response.blob();
             return { success: true, data: blob };
         }
         const data = await response.json();
         return { success: response.ok, data, error: !response.ok ? data.error : undefined };
     } catch (e: any) {
         return { success: false, error: e.message };
     }
  },

  // Credits & Coupons
  getCredits: async () => {
    const response = await backendFetch<any>('/api/account/credits');
    return { ...response, data: response.data?.data };
  },

  redeemGiftCard: async (code: string) => {
    const response = await backendFetch<any>('/api/account/credits', {
      method: 'POST',
      body: JSON.stringify({ type: 'giftcard', code }),
    });
    return { ...response, data: response.data?.data, message: response.data?.message };
  },

  addCoupon: async (code: string) => {
    const response = await backendFetch<any>('/api/account/credits', {
      method: 'POST',
      body: JSON.stringify({ type: 'coupon', code }),
    });
    return { ...response, data: response.data?.data, message: response.data?.message };
  },

  removeCoupon: async (id: string) => {
    return backendFetch(`/api/account/credits?type=coupon&id=${id}`, {
      method: 'DELETE',
    });
  },

  // Privacy Settings
  getPrivacySettings: async () => {
    const response = await backendFetch<any>('/api/account/privacy-settings');
    return { ...response, data: response.data?.data };
  },

  updatePrivacySetting: async (setting: string, value: boolean) => {
    const response = await backendFetch<any>('/api/account/privacy-settings', {
      method: 'PATCH',
      body: JSON.stringify({ setting, value }),
    });
    return { ...response, data: response.data?.data };
  },

  updateAllPrivacySettings: async (settings: Record<string, boolean>) => {
    const response = await backendFetch<any>('/api/account/privacy-settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
    return { ...response, data: response.data?.data };
  },

  // Connected Services
  getConnectedServices: async (): Promise<ApiResponse<ConnectedService[]>> => {
    const response = await backendFetch<ConnectedService[]>('/api/account/connected-services');
    return { ...response, data: response.data };
  },
  
  connectService: async (serviceId: string) => {
    const response = await backendFetch<any>('/api/account/connected-services', {
      method: 'POST',
      body: JSON.stringify({ serviceId }),
    });
    return { ...response, data: response.data?.data };
  },

  disconnectService: async (serviceId: string) => {
    return backendFetch(`/api/account/connected-services?serviceId=${serviceId}`, {
      method: 'DELETE',
    });
  },

  // Data Request (GDPR)
  getDataRequestStatus: async () => {
    const response = await backendFetch<any>('/api/account/data-request');
    return { ...response, data: response.data?.data };
  },

  requestDataExport: async () => {
    const response = await backendFetch<any>('/api/account/data-request', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return { ...response, data: response.data?.data, message: response.data?.message };
  },

  cancelDataRequest: async () => {
    return backendFetch('/api/account/data-request', {
      method: 'DELETE',
    });
  },

  // Account Deletion
  getDeletionRequirements: async () => {
    const response = await backendFetch<any>('/api/account/delete-account');
    return { ...response, data: response.data?.data };
  },

  deleteAccount: async (confirmText: string, reason?: string) => {
    return backendFetch('/api/account/delete-account', {
      method: 'POST',
      body: JSON.stringify({ confirmText, reason }),
    });
  },
};
