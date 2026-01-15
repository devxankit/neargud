import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.util.js';
import Admin from '../models/Admin.model.js';
import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';

let io;

/**
 * Setup Socket.io server
 * 
 * Environment Variables Required:
 * - SOCKET_CORS_ORIGIN: Comma-separated list of allowed CORS origins for Socket.io connections
 *   Example: "http://localhost:5173,http://localhost:3000,https://yourdomain.com"
 *   Default: "http://localhost:5173,http://localhost:3000" (if not set)
 * 
 * Socket.io uses CORS to restrict which frontend origins can connect.
 * The token is passed via auth.token in the socket handshake for authentication.
 * 
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
export const setupSocketIO = (httpServer) => {
  // Default allowed origins (always included)
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://dealing-india.vercel.app'
  ];

  // Get origins from environment variable if set
  const envOrigins = process.env.SOCKET_CORS_ORIGIN
    ? process.env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [];

  // Merge and deduplicate origins (environment origins + defaults)
  const corsOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token
      const decoded = verifyToken(token);

      // Attach user info to socket
      socket.user = decoded;

      // Fetch full user document based on role
      if (decoded.role === 'admin' && decoded.adminId) {
        const admin = await Admin.findById(decoded.adminId);
        if (!admin || !admin.isActive) {
          return next(new Error('Admin account not found or inactive'));
        }
        socket.userDoc = admin;
      } else if (decoded.role === 'user' && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
          return next(new Error('User account not found or inactive'));
        }
        socket.userDoc = user;
      } else if (decoded.role === 'vendor' && decoded.vendorId) {
        const vendor = await Vendor.findById(decoded.vendorId);
        if (!vendor || !vendor.isActive) {
          return next(new Error('Vendor account not found or inactive'));
        }
        socket.userDoc = vendor;
      }

      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    const userRole = socket.user.role;
    const userId = socket.user.adminId || socket.user.userId || socket.user.vendorId;

    // Join user's personal room
    socket.join(`${userRole}_${userId}`);
    console.log(`Socket ${socket.id} joined personal room: ${userRole}_${userId}`);

    // Join notification room for real-time notifications
    const notificationRoom = `notifications_${userId}_${userRole}`;
    socket.join(notificationRoom);

    // Admin-specific handlers
    if (userRole === 'admin') {
      // Add admin-specific handlers here if needed
    }

    // User/Vendor/Admin chat handlers
    if (['user', 'vendor', 'admin'].includes(userRole)) {
      // Chat event handlers
      socket.on('join_chat_room', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.join(`chat_${conversationId}`);
          socket.emit('joined_chat_room', { conversationId });
        }
      });

      socket.on('leave_chat_room', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.leave(`chat_${conversationId}`);
        }
      });

      // Handle sending messages completely via Socket.IO
      socket.on('send_message', async (data, callback) => {
        try {
          const { conversationId, receiverId, message, receiverRole } = data;

          if (!conversationId || !receiverId || !message) {
            if (callback) callback({ success: false, error: 'Missing required fields' });
            return;
          }

          // Dynamic import to avoid circular dependency
          // ChatService imports getSocket, which is exported from this file
          const module = await import('../services/chat.service.js');
          const ChatService = module.default;

          const newMessage = await ChatService.sendMessage(
            conversationId,
            userId,
            userRole,
            receiverId,
            receiverRole,
            message
          );

          if (callback) {
            callback({ success: true, data: newMessage });
          }
        } catch (error) {
          console.error('Socket send_message error:', error);
          if (callback) {
            callback({ success: false, error: error.message || 'Failed to send message' });
          }
        }
      });

      socket.on('typing_start', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.to(`chat_${conversationId}`).emit('user_typing', {
            conversationId,
            userId,
            userRole,
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.to(`chat_${conversationId}`).emit('user_stopped_typing', {
            conversationId,
            userId,
            userRole,
          });
        }
      });

      // Reel specific handlers
      socket.on('join_reel', (reelId) => {
        if (reelId) {
          socket.join(`reel_${reelId}`);
          console.log(`Socket ${socket.id} joined reel room: reel_${reelId}`);
        }
      });

      socket.on('leave_reel', (reelId) => {
        if (reelId) {
          socket.leave(`reel_${reelId}`);
        }
      });

      // Handle liking a reel via Socket (Real-time update for others)
      socket.on('like_reel', async (data) => {
        try {
          const { reelId } = data;
          if (!reelId || userRole !== 'user') return;

          const module = await import('../services/reelLikes.service.js');
          const result = await module.toggleReelLike(reelId, userId);

          // Broadcast the like update to anyone watching the reel (including sender for simplicity/confirmation)
          io.to(`reel_${reelId}`).emit('reel_like_update', {
            reelId,
            likes: result.likes,
            userId: userId,
            isLiked: result.isLiked
          });
        } catch (error) {
          console.error('Socket like_reel error:', error);
        }
      });

      // Handle commenting via Socket
      socket.on('send_reel_comment', async (data, callback) => {
        try {
          const { reelId, text } = data;
          if (!reelId || !text || userRole !== 'user') {
            if (callback) callback({ success: false, error: 'Invalid data' });
            return;
          }

          const module = await import('../services/reelComments.service.js');
          const comment = await module.addReelComment(reelId, userId, text);

          // Broadcast new comment to everyone in reel room
          io.to(`reel_${reelId}`).emit('new_reel_comment', {
            reelId,
            comment
          });

          if (callback) callback({ success: true, data: comment });
        } catch (error) {
          console.error('Socket send_reel_comment error:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      });

      socket.on('edit_reel_comment', async (data, callback) => {
        try {
          const { commentId, text, reelId } = data;
          if (!commentId || !text || !reelId || userRole !== 'user') {
            if (callback) callback({ success: false, error: 'Invalid data' });
            return;
          }

          const module = await import('../services/reelComments.service.js');
          const comment = await module.updateReelComment(commentId, userId, text);

          io.to(`reel_${reelId}`).emit('reel_comment_updated', {
            reelId,
            comment
          });

          if (callback) callback({ success: true, data: comment });
        } catch (error) {
          console.error('Socket edit_reel_comment error:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      });

      socket.on('delete_reel_comment', async (data, callback) => {
        try {
          const { commentId, reelId } = data;
          if (!commentId || !reelId || userRole !== 'user') {
            if (callback) callback({ success: false, error: 'Invalid data' });
            return;
          }

          const module = await import('../services/reelComments.service.js');
          await module.deleteReelComment(commentId, userId);

          io.to(`reel_${reelId}`).emit('reel_comment_deleted', {
            reelId,
            commentId
          });

          if (callback) callback({ success: true });
        } catch (error) {
          console.error('Socket delete_reel_comment error:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      });
    }

    // Support ticket event handlers
    socket.on('join_ticket_room', (data) => {
      const { ticketId } = data;
      if (ticketId) {
        socket.join(`ticket_${ticketId}`);
        socket.emit('joined_ticket_room', { ticketId });
      }
    });

    socket.on('leave_ticket_room', (data) => {
      const { ticketId } = data;
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`);
      }
    });

    // Notification event handlers
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;
        // This will be handled by the API endpoint, but we can emit confirmation
        socket.emit('notification_read_confirmed', { notificationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    socket.on('mark_all_read', async (data) => {
      try {
        // This will be handled by the API endpoint, but we can emit confirmation
        socket.emit('all_read_confirmed');
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark all as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 * @returns {Server} Socket.io instance
 */
export const getSocket = () => {
  return io;
};

