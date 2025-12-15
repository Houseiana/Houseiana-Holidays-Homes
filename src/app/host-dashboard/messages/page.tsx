'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Home, ChevronDown, Globe, Menu, Search,
  Send, Paperclip, Image as ImageIcon, MoreHorizontal, Phone, Video, Star,
  Calendar, MapPin, Users, Clock, CheckCircle, Check, CheckCheck,
  Info, X, Archive, Flag, Ban,
  BellOff, Pin, MessageSquare,
  Building2, DollarSign, FileText, ExternalLink, Copy,
  Zap, Mail
} from 'lucide-react';

export default function HouseianaHostMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TODO: Fetch from API - user's conversations
  // TODO: Fetch from API - user's conversations
  const conversations = useMemo<Array<{
    id: string;
    guest: {
      id: string;
      name: string;
      avatar: string | null;
      location: string;
      memberSince: string;
      reviews: number;
      verified: boolean;
    };
    property: {
      id: string;
      name: string;
      location: string;
    };
    booking?: {
      id: string;
      confirmationCode: string;
      checkIn: Date;
      checkOut: Date;
      guests: number;
      totalAmount: number;
      status: 'pending' | 'confirmed' | 'hosting' | 'completed' | 'cancelled';
    };
    lastMessage: {
      text: string;
      timestamp: Date;
      isFromGuest: boolean;
      isRead: boolean;
    };
    unreadCount: number;
    isStarred: boolean;
    isPinned: boolean;
    status: string;
    requiresAction?: boolean;
  }>>(() => [], []);

  // TODO: Fetch from API - messages for selected conversation
  const messagesData = useMemo<Record<string, Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Date;
    isFromGuest: boolean;
    isSystem?: boolean;
    status: 'sent' | 'delivered' | 'read';
  }>>>(() => ({}), []);

  // Quick reply templates
  const quickReplies = [
    { id: 'QR1', title: 'Check-in instructions', text: 'Here are your check-in instructions:\n\n🏠 Address: [Property Address]\n🔑 Lockbox code: [CODE]\n⏰ Check-in time: 3:00 PM\n\nPlease let me know when you arrive!' },
    { id: 'QR2', title: 'WiFi details', text: 'Here are the WiFi details:\n\n📶 Network: [NETWORK_NAME]\n🔐 Password: [PASSWORD]\n\nEnjoy your stay!' },
    { id: 'QR3', title: 'Thank you for booking', text: 'Thank you for booking with us! We are excited to host you. Please let me know if you have any questions before your arrival.' },
    { id: 'QR4', title: 'Checkout reminder', text: 'Just a friendly reminder that checkout is at 11:00 AM tomorrow. Please leave the keys in the lockbox. Thank you for staying with us!' },
    { id: 'QR5', title: 'Early check-in', text: 'I can offer early check-in at [TIME] for an additional fee of QAR [AMOUNT]. Would you like me to arrange this?' },
    { id: 'QR6', title: 'Late checkout', text: 'Late checkout until [TIME] is available for QAR [AMOUNT]. Let me know if you are interested!' },
    { id: 'QR7', title: 'Restaurant recommendations', text: 'Here are some great restaurants nearby:\n\n🍽️ [Restaurant 1] - [Cuisine]\n🍽️ [Restaurant 2] - [Cuisine]\n🍽️ [Restaurant 3] - [Cuisine]\n\nEnjoy!' },
    { id: 'QR8', title: 'Airport transfer', text: 'I can arrange airport pickup for QAR [AMOUNT]. Please share your flight details and I will coordinate with the driver.' },
  ];

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let result = conversations;

    if (activeFilter !== 'all') {
      result = result.filter(conv => {
        switch (activeFilter) {
          case 'unread': return conv.unreadCount > 0;
          case 'starred': return conv.isStarred;
          case 'pending': return conv.status === 'pending';
          case 'hosting': return conv.status === 'hosting';
          case 'archived': return conv.status === 'archived';
          default: return true;
        }
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(conv =>
        conv.guest.name.toLowerCase().includes(query) ||
        conv.property.name.toLowerCase().includes(query) ||
        conv.booking?.confirmationCode.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by last message time
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });
  }, [conversations, activeFilter, searchQuery]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const messages = useMemo(() => selectedConversation ? messagesData[selectedConversation] || [] : [], [selectedConversation, messagesData]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Send message to API
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const handleQuickReply = (reply: { id: string; title: string; text: string }) => {
    setMessageInput(reply.text);
    setShowQuickReplies(false);
  };

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    hosting: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Home className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-teal-600">Houseiana</span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              <a href="/host-dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Today</a>
              <a href="/host-dashboard/calendar" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Calendar</a>
              <a href="/host-dashboard/listings" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Listings</a>
              <a href="/host-dashboard/messages" className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-full relative">
                Messages
                {unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadTotal}
                  </span>
                )}
              </a>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1">
                Menu <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
            <div className="flex items-center gap-2">
              <a href="/client-dashboard" className="hidden lg:flex px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full">Switch to traveling</a>
              <button className="p-2 hover:bg-gray-100 rounded-full"><Globe className="w-5 h-5 text-gray-700" /></button>
              <button className="flex items-center gap-2 p-1 pl-3 border border-gray-300 rounded-full hover:shadow-md">
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm">M</div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'starred', label: 'Starred' },
                { id: 'pending', label: 'Pending' },
                { id: 'hosting', label: 'Hosting' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    activeFilter === filter.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                    selectedConversation === conv.id ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                      conv.status === 'hosting' ? 'bg-blue-500' :
                      conv.status === 'pending' ? 'bg-amber-500' : 'bg-teal-500'
                    }`}>
                      {conv.guest.name.charAt(0)}
                    </div>
                    {conv.status === 'hosting' && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conv.guest.name}
                        </span>
                        {conv.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                        {conv.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      </div>
                      <span className="text-xs text-gray-500">{formatTime(conv.lastMessage.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-1">{conv.property.name}</p>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage.text}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Conversation Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  selectedConv.status === 'hosting' ? 'bg-blue-500' :
                  selectedConv.status === 'pending' ? 'bg-amber-500' : 'bg-teal-500'
                }`}>
                  {selectedConv.guest.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{selectedConv.guest.name}</h2>
                    {selectedConv.guest.verified && <CheckCircle className="w-4 h-4 text-teal-600" />}
                    {selectedConv.booking && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedConv.booking.status]}`}>
                        {selectedConv.booking.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{selectedConv.property.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Call">
                  <Phone className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Video call">
                  <Video className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`p-2 rounded-lg ${showDetails ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                  title="Details"
                >
                  <Info className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="More">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const showDate = idx === 0 ||
                      new Date(messages[idx - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm">
                              {formatDate(msg.timestamp)}
                            </span>
                          </div>
                        )}

                        {msg.isSystem ? (
                          <div className="flex justify-center">
                            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div className={`flex ${msg.isFromGuest ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-md ${msg.isFromGuest ? 'order-2' : 'order-1'}`}>
                              <div className={`px-4 py-3 rounded-2xl ${
                                msg.isFromGuest
                                  ? 'bg-white border border-gray-200 rounded-tl-md'
                                  : 'bg-teal-600 text-white rounded-tr-md'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${msg.isFromGuest ? 'justify-start' : 'justify-end'}`}>
                                <span className="text-xs text-gray-400">{formatMessageTime(msg.timestamp)}</span>
                                {!msg.isFromGuest && (
                                  <span className="text-xs text-gray-400">
                                    {msg.status === 'read' ? (
                                      <CheckCheck className="w-3 h-3 text-teal-500" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            {msg.isFromGuest && (
                              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-medium order-1 mr-2 flex-shrink-0">
                                {selectedConv.guest.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Replies Panel */}
            {showQuickReplies && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Quick replies</h3>
                  <button onClick={() => setShowQuickReplies(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map(reply => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{reply.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{reply.text.substring(0, 50)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
              <div className="max-w-3xl mx-auto">
                {/* Pending Action Banner */}
                {selectedConv.status === 'pending' && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-amber-800">This booking request requires your response</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Decline
                      </button>
                      <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                        Accept
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <button
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Quick replies"
                      >
                        <Zap className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Attach file">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Add image">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}

        {/* Details Sidebar */}
        {showDetails && selectedConv && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200 overflow-y-auto bg-white">
            <div className="p-6">
              {/* Guest Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-medium mx-auto mb-3">
                  {selectedConv.guest.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedConv.guest.name}</h3>
                <p className="text-sm text-gray-500">{selectedConv.guest.location}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {selectedConv.guest.verified && (
                    <span className="flex items-center gap-1 text-xs text-teal-600">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{selectedConv.guest.reviews} reviews</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Mail className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Star className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Booking Details */}
              {selectedConv.booking && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Reservation</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedConv.booking.status]}`}>
                      {selectedConv.booking.status}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900">
                          {formatDate(selectedConv.booking.checkIn)} - {formatDate(selectedConv.booking.checkOut)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.ceil((selectedConv.booking.checkOut.getTime() - selectedConv.booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedConv.booking.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">QAR {selectedConv.booking.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-gray-900">{selectedConv.booking.confirmationCode}</span>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View reservation
                  </button>
                </div>
              )}

              {/* Property */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Property</h4>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedConv.property.name}</p>
                    <p className="text-sm text-gray-500">{selectedConv.property.location}</p>
                  </div>
                </div>
              </div>

              {/* Conversation Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left">
                  <Archive className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Archive conversation</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left">
                  <BellOff className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Mute notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left">
                  <Flag className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Report guest</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left text-red-600">
                  <Ban className="w-5 h-5" />
                  <span className="text-sm">Block guest</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
