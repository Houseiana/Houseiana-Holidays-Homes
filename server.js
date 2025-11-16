/**
 * Custom Next.js Server with Socket.IO
 * This server enables real-time messaging functionality
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const prisma = new PrismaClient();

// JWT verification (simplified for server.js)
function verifyToken(token) {
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
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
        console.log('Socket connection attempt without token');
        // For development, allow connection without token
        if (dev) {
          socket.data.userId = 'anonymous';
          return next();
        }
        return next(new Error('Authentication error: No token provided'));
      }

      const user = verifyToken(token);
      if (!user) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.user = user;
      socket.data.userId = user.userId || user.id;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId} (Socket: ${socket.id})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
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

        if (!isParticipant && !dev) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, contentType = 'TEXT', attachments } = data;

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

        if (!isParticipant && !dev) {
          socket.emit('error', { message: 'Not authorized to send messages' });
          return;
        }

        // Create message
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

        // Update conversation
        const isParticipant1 = conversation.participant1Id === userId;
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            lastMessagePreview: content.substring(0, 100),
            ...(isParticipant1
              ? { unreadCount2: { increment: 1 } }
              : { unreadCount1: { increment: 1 } }),
          },
        });

        // Broadcast to conversation
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message,
        });

        console.log(`📨 Message sent in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark as read
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

        if (message.senderId === userId) {
          return;
        }

        await prisma.message.update({
          where: { id: messageId },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        const isParticipant1 = message.conversation.participant1Id === userId;
        await prisma.conversation.update({
          where: { id: conversationId },
          data: isParticipant1
            ? { unreadCount1: { decrement: 1 } }
            : { unreadCount2: { decrement: 1 } },
        });

        io.to(`conversation:${conversationId}`).emit('message_read', {
          conversationId,
          messageId,
          readAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Typing indicator
    socket.on('typing', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName: socket.data.user?.firstName || 'User',
      });
    });

    // Stop typing
    socket.on('stop_typing', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId} (Socket: ${socket.id})`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n🚀 Next.js ready on http://${hostname}:${port}`);
    console.log(`💬 Socket.IO ready for real-time messaging\n`);
  });
});
