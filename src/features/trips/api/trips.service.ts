import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const TripsService = {
  async getUserTrips(userId: string): Promise<ApiResponse<{
    summary: any;
    upcoming: any[];
    past: any[];
  }>> {
    return backendFetch(`/api/trips?userId=${userId}`);
  },
};
