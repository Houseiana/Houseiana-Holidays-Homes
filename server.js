/**
 * Custom Next.js Server with Socket.IO
 * This server enables real-time messaging functionality
 * All database operations are delegated to the Backend API
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

/**
 * Make API call to backend
 */
async function backendFetch(endpoint, options = {}) {
  try {
    const url = `${BACKEND_API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || data.message || `HTTP ${response.status}` };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Backend API error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Basic JWT payload extraction (verification done by backend)
 */
function extractUserFromToken(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      userId: payload.userId || payload.sub || payload.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  } catch (error) {
    console.error('Token extraction failed:', error.message);
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
      const userId = socket.handshake.auth.userId;

      // Allow connection with either token or userId
      if (!token && !userId) {
        if (dev) {
          socket.data.userId = 'anonymous';
          return next();
        }
        return next(new Error('Authentication error: No token or userId provided'));
      }

      // If userId provided directly, trust it (token validation should be done by backend)
      if (userId) {
        socket.data.userId = userId;
        socket.data.user = { userId };
        return next();
      }

      // Extract user from token
      const user = extractUserFromToken(token);
      if (!user || !user.userId) {
        if (dev) {
          socket.data.userId = 'anonymous';
          return next();
        }
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

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verify conversation access via backend API
        const result = await backendFetch(`/api/conversations/${conversationId}`);

        if (!result.success) {
          socket.emit('error', { message: 'Conversation not found or access denied' });
          return;
        }

        const conversation = result.data;
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

    // Send message via backend API
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, contentType = 'TEXT', attachments } = data;

        // Send message via backend API
        const result = await backendFetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            senderId: userId,
            senderType: 'USER',
            content: content.trim(),
            contentType,
            attachments: attachments || [],
          }),
        });

        if (!result.success) {
          socket.emit('error', { message: result.error || 'Failed to send message' });
          return;
        }

        const message = result.data;

        // Broadcast to conversation
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message,
        });

        console.log(`Message sent in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark as read via backend API
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId, messageId } = data;

        // Mark as read via backend API
        const result = await backendFetch(`/api/conversations/${conversationId}/messages/${messageId}/read`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });

        if (!result.success) {
          socket.emit('error', { message: result.error || 'Failed to mark message as read' });
          return;
        }

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

    // Typing indicator (client-to-client, no backend needed)
    socket.on('typing', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName: socket.data.user?.firstName || 'User',
      });
    });

    // Stop typing (client-to-client, no backend needed)
    socket.on('stop_typing', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (Socket: ${socket.id})`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\nNext.js ready on http://${hostname}:${port}`);
    console.log(`Socket.IO ready for real-time messaging\n`);
  });
});
