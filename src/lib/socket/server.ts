import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { MessagingAPI } from '@/lib/backend-api';

// JWT Payload type for socket data
interface JWTPayload {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ServerToClientEvents {
  new_message: (data: {
    conversationId: string;
    message: any;
  }) => void;
  message_read: (data: {
    conversationId: string;
    messageId: string;
    readAt: string;
  }) => void;
  user_typing: (data: {
    conversationId: string;
    userId: string;
    userName: string;
  }) => void;
  user_stopped_typing: (data: {
    conversationId: string;
    userId: string;
  }) => void;
  conversation_updated: (data: {
    conversationId: string;
    updates: any;
  }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    content: string;
    contentType?: string;
    attachments?: any[];
  }) => void;
  mark_as_read: (data: {
    conversationId: string;
    messageId: string;
  }) => void;
  typing: (conversationId: string) => void;
  stop_typing: (conversationId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: JWTPayload;
  userId: string;
}

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

/**
 * Initialize Socket.IO server
 */
export function initSocketServer(httpServer: HTTPServer) {
  if (io) {
    console.log('Socket.IO server already initialized');
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  // Token verification is delegated to backend API
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      const userId = socket.handshake.auth.userId;

      if (!token && !userId) {
        return next(new Error('Authentication error: No token or userId provided'));
      }

      // For now, trust the userId from handshake auth
      // In production, verify token with backend API
      if (userId) {
        socket.data.user = { userId } as JWTPayload;
        socket.data.userId = userId;
        return next();
      }

      // If only token provided, extract userId from it (basic parsing)
      // Full verification should be done by backend
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        socket.data.user = payload as JWTPayload;
        socket.data.userId = payload.userId || payload.sub;
        next();
      } catch {
        return next(new Error('Authentication error: Invalid token format'));
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Handle connections
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);

    /**
     * Join a conversation room
     */
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        // Verify user is a participant via backend API
        const response = await MessagingAPI.getConversation(conversationId);

        if (!response.success || !response.data) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const conversation = response.data;
        const isParticipant =
          conversation.guestId === userId ||
          conversation.hostId === userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        // Join the conversation room
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    /**
     * Send a message via Backend API
     */
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;

        // Get conversation to determine sender role
        const convResponse = await MessagingAPI.getConversation(conversationId);

        if (!convResponse.success || !convResponse.data) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const conversation = convResponse.data;
        const isParticipant =
          conversation.guestId === userId ||
          conversation.hostId === userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to send messages' });
          return;
        }

        const isGuest = conversation.guestId === userId;

        // Send message via backend API
        const response = await MessagingAPI.sendMessage({
          conversationId,
          senderId: userId,
          content: content.trim(),
          senderRole: isGuest ? 'guest' : 'host',
        });

        if (!response.success) {
          socket.emit('error', { message: response.error || 'Failed to send message' });
          return;
        }

        // Broadcast to all participants in the conversation
        io?.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message: response.data,
        });

        console.log(`Message sent in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Mark message as read via Backend API
     */
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId, messageId } = data;

        const response = await MessagingAPI.markAsRead(conversationId, messageId);

        if (!response.success) {
          socket.emit('error', { message: response.error || 'Failed to mark message as read' });
          return;
        }

        // Notify other participants
        io?.to(`conversation:${conversationId}`).emit('message_read', {
          conversationId,
          messageId,
          readAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    /**
     * User is typing
     */
    socket.on('typing', async (conversationId: string) => {
      try {
        // Broadcast to others in the conversation (not to self)
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          userName: `${socket.data.user.firstName} ${socket.data.user.lastName}`,
        });
      } catch (error) {
        console.error('Error handling typing event:', error);
      }
    });

    /**
     * User stopped typing
     */
    socket.on('stop_typing', async (conversationId: string) => {
      try {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          conversationId,
          userId,
        });
      } catch (error) {
        console.error('Error handling stop typing event:', error);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (Socket: ${socket.id})`);
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

/**
 * Get existing Socket.IO server instance
 */
export function getSocketServer() {
  if (!io) {
    throw new Error('Socket.IO server not initialized. Call initSocketServer first.');
  }
  return io;
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to conversation
 */
export function emitToConversation(conversationId: string, event: keyof ServerToClientEvents, data: any) {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit(event, data);
}
