'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageHeader, MessageBubble, MessageInput, EmptyMessages } from '@/features/chat/components/legacy';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'ADMIN';
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  lastMessageAt: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
}

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const hostId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user ID from localStorage
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversation and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) {
        setError('Please log in to view messages');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const convResponse = await fetch(`/api/messages/${hostId}`, {
          headers: {
            'Authorization': `Bearer ${currentUserId}`
          }
        });

        if (!convResponse.ok) {
          throw new Error('Failed to load conversation');
        }

        const convData = await convResponse.json();

        if (convData.success) {
          setConversation(convData.data.conversation);
          setMessages(convData.data.messages || []);
        } else {
          throw new Error(convData.error || 'Failed to load conversation');
        }
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hostId, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !currentUserId) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/messages/${hostId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUserId}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newMessage.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Messages</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <MessageHeader conversation={conversation} onBack={() => router.back()} />

      {/* Error Banner */}
      {error && (
        <div className="max-w-6xl mx-auto w-full px-4 py-3">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
            <p className="text-rose-700 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
              <span className="text-lg">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <EmptyMessages hostName={conversation?.hostName} />
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwnMessage={msg.senderId === currentUserId}
                  formatTime={formatTime}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        isSending={isSending}
      />
    </div>
  );
}
