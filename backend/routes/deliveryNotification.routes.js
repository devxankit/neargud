import express from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    registerFCMToken,
    unregisterFCMToken,
    sendTestNotification,
} from "../controllers/delivery-controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";

const router = express.Router();

// Apply authentication middleware
router.use(authenticate);

// Middleware to ensure user is a delivery partner
const ensureDeliveryPartner = (req, res, next) => {
    if (req.user && req.user.role === 'delivery_partner') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Delivery Partner role required.'
        });
    }
};

router.use(ensureDeliveryPartner);


// Get notifications
router.get("/", asyncHandler(getNotifications));

// Get unread count
router.get("/unread-count", asyncHandler(getUnreadCount));

// Mark notification as read
router.put("/:id/read", asyncHandler(markAsRead));

// Mark all notifications as read
router.put("/read-all", asyncHandler(markAllAsRead));

// Delete notification
router.delete("/:id", asyncHandler(deleteNotification));

// Delete all read notifications
router.delete("/read-all", asyncHandler(deleteAllRead));

// FCM Token registration
router.post("/register-token", asyncHandler(registerFCMToken));
router.post("/unregister-token", asyncHandler(unregisterFCMToken));
router.post("/test", asyncHandler(sendTestNotification));

export default router;
