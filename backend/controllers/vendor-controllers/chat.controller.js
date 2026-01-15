import ChatService from '../../services/chat.service.js';

class VendorChatController {
  /**
   * Get vendor's conversations with users
   * GET /api/vendor/chat/conversations
   */
  async getConversations(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id;
      console.log('--- Vendor Chat Debug ---');
      console.log('Request User:', JSON.stringify(req.user, null, 2));
      console.log('Vendor ID from request:', vendorId);

      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID not found in token or user document',
        });
      }

      const conversations = await ChatService.getVendorConversations(vendorId);
      console.log('Conversations found:', conversations.length);

      res.status(200).json({
        success: true,
        data: conversations,
        count: conversations.length,
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get conversations',
      });
    }
  }

  /**
   * Create or get conversation
   * POST /api/vendor/chat/conversations
   */
  async createConversation(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id || req.user?.id;
      const { userId, type } = req.body;

      console.log('[createConversation] Payload:', { vendorId, userId, type });

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID not found' });
      }

      let conversation;

      if (type === 'admin') {
        // Chat with Admin
        // Find a default admin first
        const Admin = (await import('../../models/Admin.model.js')).default;
        const admin = await Admin.findOne({ role: 'admin' });

        if (!admin) {
          return res.status(404).json({ success: false, message: 'No admin support available' });
        }

        conversation = await ChatService.createOrGetAdminVendorConversation(admin._id, vendorId);
      } else {
        // Chat with User (Customer)
        if (!userId) {
          console.error('[createConversation] Missing userId');
          return res.status(400).json({ success: false, message: 'User ID is required for customer chat' });
        }

        // Ensure userId is a string string ID, not object
        const targetUserId = typeof userId === 'object' && userId._id ? userId._id : userId;

        conversation = await ChatService.createOrGetConversation(targetUserId, vendorId);
      }

      res.status(200).json({
        success: true,
        data: conversation,
      });

    } catch (error) {
      console.error('[createConversation] Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get messages for a conversation
   * GET /api/vendor/chat/conversations/:id/messages
   */
  async getMessages(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id;
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID not found',
        });
      }

      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await ChatService.getMessages(
        id,
        vendorId,
        'vendor',
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: {
          messages: result.messages,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get messages',
      });
    }
  }

  /**
   * Send a message
   * POST /api/vendor/chat/messages
   */
  async sendMessage(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id;
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID not found',
        });
      }

      const { conversationId, receiverId, receiverRole = 'user', message } = req.body;

      if (!conversationId || !receiverId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Conversation ID, receiver ID, and message are required',
        });
      }

      const newMessage = await ChatService.sendMessage(
        conversationId,
        vendorId,
        'vendor',
        receiverId,
        receiverRole,
        message
      );

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message',
      });
    }
  }

  /**
   * Mark message as read
   * PUT /api/vendor/chat/messages/:id/read
   */
  async markMessageAsRead(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id;
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID not found',
        });
      }

      const { id } = req.params;

      const updatedMessage = await ChatService.markMessageAsRead(id, vendorId, 'vendor');

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
        data: updatedMessage,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark message as read',
      });
    }
  }

  /**
   * Mark all messages in conversation as read
   * PUT /api/vendor/chat/conversations/:id/read-all
   */
  async markAllAsRead(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id;
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID not found',
        });
      }

      const { id } = req.params;

      await ChatService.markAllAsRead(id, vendorId, 'vendor');

      res.status(200).json({
        success: true,
        message: 'All messages marked as read',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark all messages as read',
      });
    }
  }

  /**
   * Clear chat history
   * DELETE /api/vendor/chat/conversations/:id/clear
   */
  async clearChat(req, res) {
    try {
      const vendorId = req.user?.vendorId || req.userDoc?._id || req.user?.id;
      const { id } = req.params;

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID not found' });
      }

      await ChatService.clearChat(id, vendorId, 'vendor');

      res.status(200).json({
        success: true,
        message: 'Chat history cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new VendorChatController();

