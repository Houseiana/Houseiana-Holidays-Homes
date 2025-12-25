'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MoreVertical, Phone, Video, Info } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useConversation } from '@/lib/socket/client';

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

interface ChatWindowProps {
  conversationId: string;
  title: string;
  currentUserId: string;
  token?: string;
  onClose?: () => void;
  initialMessages?: Message[];
}

export default function ChatWindow({
  conversationId,
  title,
  currentUserId,
  token,
  onClose,
  initialMessages = [],
}: ChatWindowProps) {
  const {
    messages: socketMessages,
    setMessages,
    typingUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    isConnected,
  } = useConversation(conversationId, token);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [allMessages, setAllMessages] = useState<Message[]>(initialMessages);

  // Merge initial messages with socket messages
  useEffect(() => {
    if (socketMessages.length > 0) {
      setAllMessages((prev) => {
        // Avoid duplicates
        const newMessages = socketMessages.filter(
          (msg: any) => !prev.some((m) => m.id === msg.id)
        );
        return [...prev, ...newMessages];
      });
    }
  }, [socketMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // Mark messages as read when they appear
  useEffect(() => {
    const unreadMessages = allMessages.filter(
      (msg) => !msg.isRead && msg.senderId !== currentUserId
    );

    unreadMessages.forEach((msg) => {
      markAsRead(msg.id);
    });
  }, [allMessages, currentUserId, markAsRead]);

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/support-chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setAllMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isDeleted: true, content: 'Message deleted' }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">
              {isConnected ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-gray-400">Connecting...</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Info"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {allMessages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                allMessages[index - 1].senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  onDelete={isOwnMessage ? handleDeleteMessage : undefined}
                />
              );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                  T
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <MessageInput
        onSend={handleSendMessage}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        disabled={!isConnected}
      />
    </div>
  );
}
