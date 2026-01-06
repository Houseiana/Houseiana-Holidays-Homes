'use client';

import { useEffect, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

export interface ChatNotificationData {
  id: string;
  conversationId: string;
  title: string;
  message: string;
  timestamp: Date;
}

interface ChatNotificationProps {
  notification: ChatNotificationData | null;
  onClose: () => void;
  onClick?: (conversationId: string) => void;
  duration?: number;
}

export default function ChatNotification({
  notification,
  onClose,
  onClick,
  duration = 5000,
}: ChatNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, duration, onClose]);

  if (!notification) return null;

  const handleClick = () => {
    if (onClick) {
      onClick(notification.conversationId);
    }
    onClose();
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
