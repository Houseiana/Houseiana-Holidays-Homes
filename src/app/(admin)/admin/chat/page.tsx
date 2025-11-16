'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';

interface AdminConversation {
  id: string;
  type: string;
  title: string | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  isAssigned: boolean;
  assignedToAdminId: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    profilePhoto: string | null;
  } | null;
  createdAt: Date;
}

export default function AdminChatPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && user) {
      fetchConversations();
    }
  }, [isLoaded, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/conversations');

      if (!response.ok) {
        if (response.status === 403) {
          alert('Access denied. Admin privileges required.');
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      alert('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}/claim`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to claim conversation');
      }

      // Refresh conversations
      await fetchConversations();

      // Auto-select the conversation after claiming
      setSelectedConversationId(conversationId);
    } catch (error) {
      console.error('Error claiming conversation:', error);
      alert('Failed to claim conversation');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Calculate statistics
  const unclaimedCount = conversations.filter(c => !c.isAssigned).length;
  const myConversations = conversations.filter(c => c.assignedToAdminId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Admin Support Console</h1>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-gray-600">
              Unclaimed: <strong className="text-red-600">{unclaimedCount}</strong>
            </span>
            <span className="text-gray-600">
              My Conversations: <strong className="text-blue-600">{myConversations.length}</strong>
            </span>
            <span className="text-gray-600">
              Total: <strong>{conversations.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-4 p-4">
        {/* Conversations List */}
        <div className="w-96 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Support Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No support conversations</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversationId === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {conv.client?.profilePhoto ? (
                          <img
                            src={conv.client.profilePhoto}
                            alt={`${conv.client.firstName} ${conv.client.lastName}`}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold">
                            {conv.client?.firstName?.[0]}{conv.client?.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {conv.client ? `${conv.client.firstName} ${conv.client.lastName}` : 'Unknown'}
                          </span>
                          {!conv.isAssigned && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded inline-block mt-1">
                              Unclaimed
                            </span>
                          )}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessagePreview}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : 'No messages'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-lg shadow-sm">
          {selectedConversationId && selectedConversation && user ? (
            <div className="h-full flex flex-col">
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedConversation.client?.profilePhoto ? (
                      <img
                        src={selectedConversation.client.profilePhoto}
                        alt={`${selectedConversation.client.firstName} ${selectedConversation.client.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                        {selectedConversation.client?.firstName?.[0]}{selectedConversation.client?.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.client
                          ? `${selectedConversation.client.firstName} ${selectedConversation.client.lastName}`
                          : 'Support Chat'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.type === 'GUEST_SUPPORT' ? 'Guest Support' : 'Host Support'}
                      </p>
                    </div>
                  </div>
                  {!selectedConversation.isAssigned && (
                    <button
                      onClick={() => handleClaimConversation(selectedConversationId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Claim Conversation
                    </button>
                  )}
                  {selectedConversation.isAssigned && selectedConversation.assignedToAdminId === user.id && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Assigned to you
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  conversationId={selectedConversationId}
                  title={selectedConversation.title || 'Support Chat'}
                  currentUserId={user.id}
                  initialMessages={[]}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-2">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
