export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: MessageType;
  timestamp: Date;
  isRead: boolean;
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  bookingId?: string;
  propertyId?: string;
  lastMessage: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  profilePhoto?: string;
  role: 'host' | 'guest';
  isOnline: boolean;
  lastSeen?: Date;
}

export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  thumbnail?: string;
}

export interface MessageMetadata {
  bookingDetails?: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalAmount: number;
  };
  propertyDetails?: {
    title: string;
    address: string;
    photos: string[];
  };
  systemAction?: {
    type: 'booking_confirmed' | 'booking_cancelled' | 'check_in_reminder' | 'check_out_reminder';
    data: any;
  };
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  BOOKING_REQUEST = 'booking_request',
  BOOKING_UPDATE = 'booking_update'
}

export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType: MessageType;
  attachments?: File[];
}

export interface CreateConversationRequest {
  participantId: string;
  bookingId?: string;
  propertyId?: string;
  initialMessage: string;
}

export interface MessageFilter {
  conversationId?: string;
  isRead?: boolean;
  messageType?: MessageType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ConversationFilter {
  isArchived?: boolean;
  hasUnread?: boolean;
  bookingId?: string;
  propertyId?: string;
}

export interface MessageStats {
  totalConversations: number;
  unreadConversations: number;
  responseRate: number;
  averageResponseTime: number;
  totalMessages: number;
  messagesThisWeek: number;
}
