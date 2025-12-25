'use client';

import { Message } from '@/hooks';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  onClick: () => void;
}

export function MessageItem({ message, isLast, onClick }: MessageItemProps) {
  return (
    <div
      className={`flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
        !isLast ? 'border-b border-gray-200' : ''
      }`}
      onClick={onClick}
    >
      {/* Host Avatar */}
      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-lg font-semibold">
          {message.hostAvatar}
        </span>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900">{message.hostName}</h3>
          <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
            {message.lastMessageTime}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{message.propertyTitle}</p>
        <p className={`text-sm ${message.unread ? 'font-medium text-gray-900' : 'text-gray-600'} truncate`}>
          {message.lastMessage}
        </p>
      </div>

      {/* Unread Indicator */}
      {message.unread && (
        <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
