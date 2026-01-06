'use client';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'ADMIN';
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  formatTime: (dateString: string) => string;
}

export function MessageBubble({ message, isOwnMessage, formatTime }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
