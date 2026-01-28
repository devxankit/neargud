import notificationService from '../../services/notification.service.js';
import {
    registerFCMToken,
    unregisterFCMToken,
    sendTestNotification
} from '../user-controllers/notification.controller.js';

/**
 * Get delivery partner notifications
 * GET /api/delivery/notifications
 */
export const getNotifications = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user._id || req.user.userId || req.user.id;
        const filters = {
            page: req.query.page,
            limit: req.query.limit,
            isRead: req.query.isRead,
            type: req.query.type,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };

        const result = await notificationService.getNotifications(deliveryPartnerId, 'delivery_partner', filters);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get unread notification count
 * GET /api/delivery/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user._id || req.user.userId || req.user.id;
        const count = await notificationService.getUnreadCount(deliveryPartnerId, 'delivery_partner');

        return res.status(200).json({
            success: true,
            data: { unreadCount: count },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark notification as read
 * PUT /api/delivery/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user._id || req.user.userId || req.user.id;
        const { id } = req.params;
        const io = req.app.get('io');

        const notification = await notificationService.markAsRead(id, deliveryPartnerId, 'delivery_partner', io);

        return res.status(200).json({
            success: true,
            data: notification,
            message: 'Notification marked as read',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark all notifications as read
 * PUT /api/delivery/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user._id || req.user.userId || req.user.id;
        const io = req.app.get('io');

        const result = await notificationService.markAllAsRead(deliveryPartnerId, 'delivery_partner', io);

        return res.status(200).json({
            success: true,
            data: { modifiedCount: result.modifiedCount },
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete notification
 * DELETE /api/delivery/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user._id || req.user.userId || req.user.id;
        const { id } = req.params;
        const io = req.app.get('io');

        await notificationService.deleteNotification(id, deliveryPartnerId, 'delivery_partner', io);

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete all read notifications
 * DELETE /api/delivery/notifications/read-all
 */
export const deleteAllRead = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user._id || req.user.userId || req.user.id;
        const io = req.app.get('io');

        const result = await notificationService.deleteAllRead(deliveryPartnerId, 'delivery_partner', io);

        return res.status(200).json({
            success: true,
            data: { deletedCount: result.deletedCount },
            message: 'All read notifications deleted',
        });
    } catch (error) {
        next(error);
    }
};

// Re-export common functions
export { registerFCMToken, unregisterFCMToken, sendTestNotification };
