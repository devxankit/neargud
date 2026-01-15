import express from 'express';
import AdminChatController from '../controllers/admin-controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/conversations', AdminChatController.getConversations);
router.get('/conversations/:id/messages', AdminChatController.getMessages);
router.post('/messages', AdminChatController.sendMessage);
router.put('/messages/:id/read', AdminChatController.markMessageAsRead);
router.put('/conversations/:id/read-all', AdminChatController.markAllAsRead);
router.delete('/conversations/:id/clear', AdminChatController.clearChat);

// Helper to start chat
router.post('/conversations/vendor', AdminChatController.initiateVendorChat);

export default router;
