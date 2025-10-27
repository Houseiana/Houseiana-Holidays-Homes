'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Paperclip,
  Send,
  Check,
  MoreVertical,
  Trash2,
  Image,
  FileText
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  size?: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'host' | 'guest';
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  messages: Message[];
  conversationType: 'booking' | 'general' | 'support';
  bookingStatus?: 'inquiry' | 'confirmed' | 'active' | 'completed';
}

interface MessageFilter {
  type: 'all' | 'unread' | 'hosts' | 'support';
  sortBy: 'recent' | 'unread' | 'name';
}

export default function MessagesInbox() {
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<MessageFilter>({
    type: 'all',
    sortBy: 'recent'
  });

  const userProfile = {
    id: 'user-1',
    name: 'Alex Johnson',
    initials: 'AJ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  };

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      participantId: 'host-1',
      participantName: 'Sarah Wilson',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      participantRole: 'host',
      propertyId: 'prop-1',
      propertyTitle: 'Luxury Beachfront Villa',
      propertyImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      lastMessage: {
        id: 'msg-3',
        senderId: 'host-1',
        senderName: 'Sarah Wilson',
        content: 'Perfect! I\'ll have the property ready for your arrival. The check-in instructions will be sent closer to your date.',
        timestamp: '2025-01-18T14:30:00Z',
        isRead: false
      },
      unreadCount: 1,
      isOnline: true,
      conversationType: 'booking',
      bookingStatus: 'confirmed',
      messages: [
        {
          id: 'msg-1',
          senderId: 'user-1',
          senderName: 'Alex',
          content: 'Hi Sarah! I\'m interested in booking your beachfront villa for January 15-20. Is it available?',
          timestamp: '2025-01-18T10:15:00Z',
          isRead: true
        },
        {
          id: 'msg-2',
          senderId: 'host-1',
          senderName: 'Sarah Wilson',
          content: 'Hello Alex! Yes, the villa is available for those dates. It\'s a beautiful property right on the beach with stunning ocean views. Would you like to proceed with the booking?',
          timestamp: '2025-01-18T10:45:00Z',
          isRead: true
        },
        {
          id: 'msg-3',
          senderId: 'host-1',
          senderName: 'Sarah Wilson',
          content: 'Perfect! I\'ll have the property ready for your arrival. The check-in instructions will be sent closer to your date.',
          timestamp: '2025-01-18T14:30:00Z',
          isRead: false
        }
      ]
    },
    {
      id: 'conv-2',
      participantId: 'host-2',
      participantName: 'Michael Chen',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      participantRole: 'host',
      propertyId: 'prop-2',
      propertyTitle: 'Cozy Mountain Cabin',
      propertyImage: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      lastMessage: {
        id: 'msg-6',
        senderId: 'user-1',
        senderName: 'Alex',
        content: 'Thanks for the quick response! I\'ll book it right now.',
        timestamp: '2025-01-18T09:20:00Z',
        isRead: true
      },
      unreadCount: 0,
      isOnline: false,
      lastSeen: '2025-01-18T12:00:00Z',
      conversationType: 'booking',
      bookingStatus: 'confirmed',
      messages: [
        {
          id: 'msg-4',
          senderId: 'user-1',
          senderName: 'Alex',
          content: 'Hi! Is your mountain cabin pet-friendly? I\'d love to bring my dog.',
          timestamp: '2025-01-18T08:30:00Z',
          isRead: true
        },
        {
          id: 'msg-5',
          senderId: 'host-2',
          senderName: 'Michael Chen',
          content: 'Yes, we welcome pets! There\'s a $50 pet fee and a secure fenced yard. Your dog will love it here!',
          timestamp: '2025-01-18T09:15:00Z',
          isRead: true
        },
        {
          id: 'msg-6',
          senderId: 'user-1',
          senderName: 'Alex',
          content: 'Thanks for the quick response! I\'ll book it right now.',
          timestamp: '2025-01-18T09:20:00Z',
          isRead: true
        }
      ]
    },
    {
      id: 'conv-3',
      participantId: 'support-1',
      participantName: 'Houseiana Support',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Support',
      participantRole: 'host',
      lastMessage: {
        id: 'msg-8',
        senderId: 'support-1',
        senderName: 'Houseiana Support',
        content: 'Your refund has been processed and should appear in your account within 3-5 business days. Is there anything else I can help you with?',
        timestamp: '2025-01-17T16:45:00Z',
        isRead: false
      },
      unreadCount: 1,
      isOnline: true,
      conversationType: 'support',
      messages: [
        {
          id: 'msg-7',
          senderId: 'user-1',
          senderName: 'Alex',
          content: 'I need help with a refund for my cancelled booking. The cancellation was due to a family emergency.',
          timestamp: '2025-01-17T15:30:00Z',
          isRead: true
        },
        {
          id: 'msg-8',
          senderId: 'support-1',
          senderName: 'Houseiana Support',
          content: 'Your refund has been processed and should appear in your account within 3-5 business days. Is there anything else I can help you with?',
          timestamp: '2025-01-17T16:45:00Z',
          isRead: false
        }
      ]
    }
  ]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      if (conversations.length > 0) {
        selectConversation(conversations[0]);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        conv.participantName.toLowerCase().includes(term) ||
        conv.lastMessage.content.toLowerCase().includes(term) ||
        (conv.propertyTitle && conv.propertyTitle.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }

    // Type filter
    switch (currentFilter.type) {
      case 'unread':
        return conv.unreadCount > 0;
      case 'hosts':
        return conv.participantRole === 'host' && conv.conversationType === 'booking';
      case 'support':
        return conv.conversationType === 'support';
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (currentFilter.sortBy) {
      case 'recent':
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      case 'unread':
        return b.unreadCount - a.unreadCount;
      case 'name':
        return a.participantName.localeCompare(b.participantName);
      default:
        return 0;
    }
  });

  const messageStats = {
    total: conversations.length,
    unread: conversations.filter(c => c.unreadCount > 0).length,
    hosts: conversations.filter(c => c.participantRole === 'host' && c.conversationType === 'booking').length,
    support: conversations.filter(c => c.conversationType === 'support').length
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    markAsRead(conversation);
  };

  const markAsRead = (conversation: Conversation) => {
    if (conversation.unreadCount > 0) {
      setConversations(prev => prev.map(conv =>
        conv.id === conversation.id
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map(msg =>
                msg.senderId !== userProfile.id ? { ...msg, isRead: true } : msg
              )
            }
          : conv
      ));
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: userProfile.id,
      senderName: userProfile.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message
          }
        : conv
    ));

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: message
    } : null);

    setNewMessage('');

    // Simulate response for host conversations
    if (selectedConversation.participantRole === 'host') {
      setTimeout(() => {
        simulateHostResponse();
      }, 2000);
    }
  };

  const simulateHostResponse = () => {
    if (!selectedConversation) return;

    const responses = [
      "Thanks for your message! I'll get back to you shortly.",
      "Let me check on that for you.",
      "That sounds great! I'll make a note of it.",
      "No problem at all! Happy to help.",
      "I'll take care of that right away."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const hostMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: selectedConversation.participantId,
      senderName: selectedConversation.participantName,
      content: randomResponse,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, hostMessage],
            lastMessage: hostMessage,
            unreadCount: conv.unreadCount + 1
          }
        : conv
    ));

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, hostMessage],
      lastMessage: hostMessage,
      unreadCount: prev.unreadCount + 1
    } : null);
  };

  const deleteConversation = (conversation: Conversation) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== conversation.id);
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getConversationStatusClass = (conversation: Conversation): string => {
    switch (conversation.bookingStatus) {
      case 'inquiry':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  const getConversationTypeIcon = (conversation: Conversation): string => {
    switch (conversation.conversationType) {
      case 'booking':
        return '🏠';
      case 'support':
        return '🛟';
      case 'general':
        return '💬';
      default:
        return '💬';
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const navigateBack = () => {
    router.push('/client-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-gray-600 text-sm">Connect with hosts and support</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userProfile.initials}
              </div>
              <div className="hidden md:block">
                <div className="font-medium text-gray-900">{userProfile.name}</div>
                <div className="text-sm text-gray-500">💬 Communicator</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">

            {/* Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-900">{messageStats.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">{messageStats.unread}</div>
                  <div className="text-xs text-gray-500">Unread</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{messageStats.hosts}</div>
                  <div className="text-xs text-gray-500">Hosts</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{messageStats.support}</div>
                  <div className="text-xs text-gray-500">Support</div>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 text-sm">
                {['all', 'unread', 'hosts', 'support'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCurrentFilter(prev => ({ ...prev, type: type as any }))}
                    className={`px-3 py-1 rounded-full capitalize transition-colors ${
                      currentFilter.type === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <select
                value={currentFilter.sortBy}
                onChange={(e) => setCurrentFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="unread">Unread First</option>
                <option value="name">By Name</option>
              </select>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start a conversation with a host!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'hover:bg-gray-50'
                      } ${conversation.unreadCount > 0 ? 'border-l-4 border-l-blue-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img
                            src={conversation.participantAvatar}
                            alt={conversation.participantName}
                            className="w-10 h-10 rounded-full"
                          />
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">
                                {conversation.participantName}
                              </span>
                              <span className="text-sm">
                                {getConversationTypeIcon(conversation)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>

                          {conversation.propertyTitle && (
                            <div className="flex items-center gap-2 mb-1">
                              {conversation.propertyImage && (
                                <img
                                  src={conversation.propertyImage}
                                  alt={conversation.propertyTitle}
                                  className="w-4 h-4 rounded object-cover"
                                />
                              )}
                              <span className="text-xs text-gray-600 truncate">
                                {conversation.propertyTitle}
                              </span>
                            </div>
                          )}

                          <p className={`text-sm truncate ${
                            !conversation.lastMessage.isRead && conversation.lastMessage.senderId !== userProfile.id
                              ? 'font-medium text-gray-900'
                              : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.content}
                          </p>

                          {conversation.bookingStatus && (
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getConversationStatusClass(conversation)}`}>
                                {conversation.bookingStatus}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedConversation.participantAvatar}
                        alt={selectedConversation.participantName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedConversation.participantName}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {selectedConversation.isOnline ? (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Online
                            </span>
                          ) : selectedConversation.lastSeen ? (
                            `Last seen ${formatTime(selectedConversation.lastSeen)}`
                          ) : (
                            'Offline'
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedConversation.propertyTitle && (
                      <div className="flex items-center gap-2">
                        {selectedConversation.propertyImage && (
                          <img
                            src={selectedConversation.propertyImage}
                            alt={selectedConversation.propertyTitle}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {selectedConversation.propertyTitle}
                          </div>
                          {selectedConversation.bookingStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getConversationStatusClass(selectedConversation)}`}>
                              {selectedConversation.bookingStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === userProfile.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                          message.senderId === userProfile.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          message.senderId === userProfile.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatMessageTime(message.timestamp)}</span>
                          {message.senderId === userProfile.id && (
                            <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-200' : 'text-blue-300'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      {showAttachmentMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => {
                              console.log('Adding image');
                              setShowAttachmentMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                          >
                            <Image className="w-4 h-4" />
                            Photo
                          </button>
                          <button
                            onClick={() => {
                              console.log('Adding document');
                              setShowAttachmentMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                          >
                            <FileText className="w-4 h-4" />
                            Document
                          </button>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-2 rounded-lg transition-colors ${
                        newMessage.trim()
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}