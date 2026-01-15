import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    registerFCMToken,
    unregisterFCMToken,
    sendTestNotification,
} from '../controllers/user-controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.post('/register-token', registerFCMToken);
router.post('/unregister-token', unregisterFCMToken);
router.post('/test', sendTestNotification); // Test route

export default router;
