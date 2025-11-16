'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useCallback, useRef } from 'react';

interface ServerToClientEvents {
  new_message: (data: { conversationId: string; message: any }) => void;
  message_read: (data: { conversationId: string; messageId: string; readAt: string }) => void;
  user_typing: (data: { conversationId: string; userId: string; userName: string }) => void;
  user_stopped_typing: (data: { conversationId: string; userId: string }) => void;
  conversation_updated: (data: { conversationId: string; updates: any }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    content: string;
    contentType?: string;
    attachments?: any[];
  }) => void;
  mark_as_read: (data: { conversationId: string; messageId: string }) => void;
  typing: (conversationId: string) => void;
  stop_typing: (conversationId: string) => void;
}

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: SocketClient | null = null;

/**
 * Get or create Socket.IO client instance
 */
export function getSocketClient(token?: string): SocketClient {
  if (!socketInstance || !socketInstance.connected) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

    socketInstance = io(url, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  return socketInstance;
}

/**
 * Disconnect socket client
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * React hook for Socket.IO connection
 */
export function useSocket(token?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<SocketClient | null>(null);

  useEffect(() => {
    if (!token) return;

    const client = getSocketClient(token);
    setSocket(client);

    if (!client.connected) {
      client.connect();
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    client.on('connect', handleConnect);
    client.on('disconnect', handleDisconnect);

    return () => {
      client.off('connect', handleConnect);
      client.off('disconnect', handleDisconnect);
    };
  }, [token]);

  return { socket, isConnected };
}

/**
 * React hook for conversation
 */
export function useConversation(conversationId: string | null, token?: string) {
  const { socket, isConnected } = useSocket(token);
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<{ [userId: string]: NodeJS.Timeout }>({});

  // Join conversation
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    return () => {
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, isConnected, conversationId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (data: { conversationId: string; message: any }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleMessageRead = (data: { conversationId: string; messageId: string; readAt: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    };

    const handleUserTyping = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));

        // Clear existing timeout
        if (typingTimeoutRef.current[data.userId]) {
          clearTimeout(typingTimeoutRef.current[data.userId]);
        }

        // Auto-remove after 3 seconds
        typingTimeoutRef.current[data.userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });

        // Clear timeout
        if (typingTimeoutRef.current[data.userId]) {
          clearTimeout(typingTimeoutRef.current[data.userId]);
          delete typingTimeoutRef.current[data.userId];
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);

      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
      typingTimeoutRef.current = {};
    };
  }, [socket, conversationId]);

  // Send message
  const sendMessage = useCallback(
    (content: string, contentType = 'TEXT', attachments?: any[]) => {
      if (!socket || !conversationId) return;
      socket.emit('send_message', {
        conversationId,
        content,
        contentType,
        attachments,
      });
    },
    [socket, conversationId]
  );

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socket || !conversationId) return;
      socket.emit('mark_as_read', { conversationId, messageId });
    },
    [socket, conversationId]
  );

  // Typing indicator
  const startTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit('typing', conversationId);
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit('stop_typing', conversationId);
  }, [socket, conversationId]);

  return {
    messages,
    setMessages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    isConnected,
  };
}

/**
 * React hook for listening to new messages across all conversations
 */
export function useMessageNotifications(token?: string, onNewMessage?: (data: any) => void) {
  const { socket, isConnected } = useSocket(token);

  useEffect(() => {
    if (!socket || !onNewMessage) return;

    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('new_message', onNewMessage);
    };
  }, [socket, onNewMessage]);

  return { isConnected };
}
