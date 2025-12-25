import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const MessagingService = {
  async getConversation(conversationId: string): Promise<ApiResponse<any>> {
    return backendFetch(`/api/conversations/${conversationId}`);
  },

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    senderRole: 'guest' | 'host';
  }): Promise<ApiResponse<any>> {
    return backendFetch(`/api/conversations/${data.conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markAsRead(conversationId: string, messageId: string): Promise<ApiResponse<any>> {
    return backendFetch(`/api/conversations/${conversationId}/messages/${messageId}/read`, {
      method: 'POST',
    });
  },

  async getUserConversations(userId: string): Promise<ApiResponse<any[]>> {
    return backendFetch(`/api/conversations?userId=${userId}`);
  },
};
