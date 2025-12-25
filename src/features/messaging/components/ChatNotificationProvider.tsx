'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import ChatNotification, { ChatNotificationData } from './ChatNotification';
import { useMessageNotifications } from '@/lib/socket/client';

interface ChatNotificationContextType {
  showNotification: (notification: ChatNotificationData) => void;
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  requestNotificationPermission: () => Promise<void>;
}

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(undefined);

export function useChatNotifications() {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error('useChatNotifications must be used within ChatNotificationProvider');
  }
  return context;
}

interface ChatNotificationProviderProps {
  children: ReactNode;
  token?: string;
  currentUserId?: string;
}

export default function ChatNotificationProvider({
  children,
  token,
  currentUserId,
}: ChatNotificationProviderProps) {
  const [notification, setNotification] = useState<ChatNotificationData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      setHasNotificationPermission(true);
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setHasNotificationPermission(permission === 'granted');
    }
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setHasNotificationPermission(true);
    }
  }, []);

  // Show notification (both in-app and browser)
  const showNotification = useCallback(
    (notificationData: ChatNotificationData) => {
      // Show in-app notification
      setNotification(notificationData);

      // Show browser notification if permission granted and tab is not focused
      if (hasNotificationPermission && document.hidden) {
        const browserNotification = new Notification(notificationData.title, {
          body: notificationData.message,
          icon: '/icon-192x192.png', // Add your app icon
          badge: '/badge-72x72.png', // Add your app badge
          tag: notificationData.conversationId, // Prevent duplicates
          requireInteraction: false,
        });

        browserNotification.onclick = () => {
          window.focus();
          // Navigate to conversation or trigger custom action
          browserNotification.close();
        };
      }

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification-sound.mp3'); // Add your sound file
        audio.volume = 0.5;
        audio.play().catch((err) => console.log('Could not play sound:', err));
      } catch (err) {
        // Ignore sound errors
      }
    },
    [hasNotificationPermission]
  );

  // Handle new messages from socket
  const handleNewMessage = useCallback(
    (data: { conversationId: string; message: any }) => {
      // Don't show notification for own messages
      if (data.message.senderId === currentUserId) {
        return;
      }

      // Don't show if already on the conversation page (implement this check)
      // For now, always show

      showNotification({
        id: data.message.id,
        conversationId: data.conversationId,
        title: 'New Message',
        message: data.message.content,
        timestamp: new Date(data.message.createdAt),
      });
    },
    [currentUserId, showNotification]
  );

  // Listen to socket messages
  useMessageNotifications(token, handleNewMessage);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleNotificationClick = (conversationId: string) => {
    // Navigate to conversation
    // You can use Next.js router here
    window.location.href = `/messages?conversation=${conversationId}`;
  };

  return (
    <ChatNotificationContext.Provider
      value={{
        showNotification,
        unreadCount,
        setUnreadCount,
        requestNotificationPermission,
      }}
    >
      {children}
      <ChatNotification
        notification={notification}
        onClose={handleCloseNotification}
        onClick={handleNotificationClick}
      />
    </ChatNotificationContext.Provider>
  );
}
