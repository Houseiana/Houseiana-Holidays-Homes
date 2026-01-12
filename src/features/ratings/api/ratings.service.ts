import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const RatingsService = {
  reviewPropertyByGuest: async (payload: {
    guestId: string;
    propertyId: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse> => {
    return backendFetch('/api/ratings/property-by-guest', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
