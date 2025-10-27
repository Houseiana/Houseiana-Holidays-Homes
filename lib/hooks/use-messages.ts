import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, SendMessageRequest } from '@/types/message';
import { apiClient } from '@/lib/api-client';

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Conversation[]>('messages/conversations');
      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setError(response.message || 'Failed to load conversations');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversationById = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get<Conversation>(`messages/conversations/${id}`);
      return response.data || null;
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
      return null;
    }
  }, []);

  const getMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await apiClient.get<Message[]>(`messages/conversations/${conversationId}/messages`);
      return response.data || [];
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (data: SendMessageRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Message>('messages/send', data);
      if (response.success && response.data) {
        await loadConversations();
        return response.data;
      }
      throw new Error(response.message || 'Failed to send message');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await apiClient.post(`messages/conversations/${conversationId}/mark-read`, {});
      await loadConversations();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [loadConversations]);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    getConversationById,
    getMessages,
    sendMessage,
    markAsRead,
    refetch: loadConversations
  };
}
