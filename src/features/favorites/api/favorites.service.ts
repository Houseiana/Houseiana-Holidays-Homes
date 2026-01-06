import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const FavoritesService = {
  async getUserFavorites(userId: string): Promise<ApiResponse<any[]>> {
    return backendFetch(`/api/favorites?userId=${userId}`);
  },

  async addFavorite(userId: string, propertyId: string): Promise<ApiResponse> {
    return backendFetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ userId, propertyId }),
    });
  },

  async removeFavorite(favoriteId: string, userId: string): Promise<ApiResponse> {
    return backendFetch(`/api/favorites/${favoriteId}?userId=${userId}`, {
      method: 'DELETE',
    });
  },
};
