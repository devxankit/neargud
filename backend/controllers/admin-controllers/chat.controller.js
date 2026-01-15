import ChatService from '../../services/chat.service.js';

class AdminChatController {
    /**
     * Get admin's conversations
     * GET /api/admin/chat/conversations
     */
    async getConversations(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id;

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID not found in token or user document',
                });
            }

            const conversations = await ChatService.getAdminConversations(adminId);

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
     * Get messages for a conversation
     * GET /api/admin/chat/conversations/:id/messages
     */
    async getMessages(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id;
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID not found',
                });
            }

            const { id } = req.params;
            const { page = 1, limit = 50 } = req.query;

            const result = await ChatService.getMessages(
                id,
                adminId,
                'admin',
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
     * POST /api/admin/chat/messages
     */
    async sendMessage(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id;
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID not found',
                });
            }

            const { conversationId, receiverId, receiverRole = 'vendor', message } = req.body;

            if (!conversationId || !receiverId || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Conversation ID, receiver ID, and message are required',
                });
            }

            const newMessage = await ChatService.sendMessage(
                conversationId,
                adminId,
                'admin',
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
     * PUT /api/admin/chat/messages/:id/read
     */
    async markMessageAsRead(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id;
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID not found',
                });
            }

            const { id } = req.params;

            const updatedMessage = await ChatService.markMessageAsRead(id, adminId, 'admin');

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
     * PUT /api/admin/chat/conversations/:id/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id;
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID not found',
                });
            }

            const { id } = req.params;

            await ChatService.markAllAsRead(id, adminId, 'admin');

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
     * Create or get conversation with a vendor
     * POST /api/admin/chat/conversations/vendor
     */
    async initiateVendorChat(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id;
            const { vendorId } = req.body;

            if (!vendorId) {
                return res.status(400).json({ success: false, message: 'Vendor ID is required' });
            }

            const conversation = await ChatService.createOrGetAdminVendorConversation(adminId, vendorId);

            res.status(200).json({
                success: true,
                data: conversation,
            });

        } catch (error) {
            console.error('Error initiating chat:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Clear chat history
     * DELETE /api/admin/chat/conversations/:id/clear
     */
    async clearChat(req, res) {
        try {
            const adminId = req.user?.adminId || req.userDoc?._id || req.user?.id;
            const { id } = req.params;

            if (!adminId) {
                return res.status(400).json({ success: false, message: 'Admin ID not found' });
            }

            await ChatService.clearChat(id, adminId, 'admin');

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

export default new AdminChatController();
