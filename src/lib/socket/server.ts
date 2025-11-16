import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, JWTPayload } from '@/lib/auth';
import prisma from '@/lib/prisma-client';

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
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const user = verifyToken(token);
      if (!user) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.user = user;
      socket.data.userId = user.userId;
      next();
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
        // Verify user is a participant in this conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant =
          conversation.participant1Id === userId ||
          conversation.participant2Id === userId;

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
     * Send a message
     */
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, contentType = 'TEXT', attachments } = data;

        // Verify user is participant
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant =
          conversation.participant1Id === userId ||
          conversation.participant2Id === userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to send messages' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            senderType: 'USER',
            content: content.trim(),
            contentType,
            attachments: attachments || [],
            deliveredAt: new Date(),
          },
        });

        // Determine which participant sent the message
        const isParticipant1 = conversation.participant1Id === userId;

        // Update conversation
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            lastMessagePreview: content.substring(0, 100),
            // Increment unread count for the other participant
            ...(isParticipant1
              ? { unreadCount2: { increment: 1 } }
              : { unreadCount1: { increment: 1 } }),
          },
        });

        // Broadcast to all participants in the conversation
        io?.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message,
        });

        console.log(`Message sent in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Mark message as read
     */
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId, messageId } = data;

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { conversation: true },
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Can't mark own message as read
        if (message.senderId === userId) {
          return;
        }

        // Update message
        const updatedMessage = await prisma.message.update({
          where: { id: messageId },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        // Update conversation unread count
        const isParticipant1 = message.conversation.participant1Id === userId;
        await prisma.conversation.update({
          where: { id: conversationId },
          data: isParticipant1
            ? { unreadCount1: { decrement: 1 } }
            : { unreadCount2: { decrement: 1 } },
        });

        // Notify other participants
        io?.to(`conversation:${conversationId}`).emit('message_read', {
          conversationId,
          messageId,
          readAt: updatedMessage.readAt?.toISOString() || new Date().toISOString(),
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
export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to conversation
 */
export function emitToConversation(conversationId: string, event: string, data: any) {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit(event, data);
}
