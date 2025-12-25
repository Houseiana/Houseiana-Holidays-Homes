'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  type: string;
  title: string | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  isActive: boolean;
  isMuted: boolean;
  otherParticipantId: string;
  otherParticipantType: string;
  createdAt: Date;
}

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export default function ChatList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading = false,
}: ChatListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`
            p-4 border-b border-gray-200 cursor-pointer transition-colors
            ${selectedConversationId === conversation.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {conversation.title ? conversation.title.charAt(0).toUpperCase() : 'C'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.title || `${conversation.type} Conversation`}
                </h3>
                {conversation.lastMessageAt && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>

              {/* Last message preview */}
              {conversation.lastMessagePreview && (
                <p className="text-sm text-gray-600 truncate mb-1">
                  {conversation.lastMessagePreview}
                </p>
              )}

              {/* Indicators */}
              <div className="flex items-center gap-2">
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
                {conversation.isMuted && (
                  <span className="text-xs text-gray-500">Muted</span>
                )}
                <span
                  className={`inline-flex items-center gap-1 text-xs ${
                    conversation.isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <Circle className="w-2 h-2 fill-current" />
                  {conversation.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
