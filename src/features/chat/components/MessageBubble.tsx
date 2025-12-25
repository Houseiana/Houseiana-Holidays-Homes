'use client';

import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Trash2, Edit2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  contentType: string;
  senderId: string;
  senderType: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  isSystemMessage: boolean;
  createdAt: Date;
  readAt: Date | null;
  attachments?: any[];
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  onDelete,
  onEdit,
}: MessageBubbleProps) {
  // System messages
  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOwnMessage ? 'bg-blue-600' : 'bg-gray-400'
          } text-white text-sm font-semibold`}
        >
          {isOwnMessage ? 'Y' : 'T'}
        </div>
      )}

      {/* Message content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`group relative px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.isDeleted ? (
              <span className="italic opacity-70">This message was deleted</span>
            ) : (
              message.content
            )}
          </p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment: any, index: number) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-20 rounded p-2 text-xs"
                >
                  {attachment.name || 'Attachment'}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons (only for own messages) */}
          {isOwnMessage && !message.isDeleted && (
            <div className="absolute top-0 right-full mr-2 hidden group-hover:flex gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(message.id)}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  title="Edit message"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                  title="Delete message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>
          {message.isEdited && <span className="italic">(edited)</span>}
          {isOwnMessage && (
            <span>
              {message.isRead ? (
                <CheckCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <Check className="w-4 h-4 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
