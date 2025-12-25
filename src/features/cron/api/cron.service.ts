import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const CronService = {
  async cleanupExpiredBookings(cronSecret?: string): Promise<ApiResponse> {
    return backendFetch('/api/cron/cleanup-bookings', {
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });
  },

  async expireBookings(cronSecret?: string): Promise<ApiResponse> {
    return backendFetch('/api/cron/expire-bookings', {
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });
  },
};
