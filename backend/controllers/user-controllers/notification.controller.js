import notificationService from "../../services/notification.service.js";
import firebaseService from "../../services/firebase.service.js";

/**
 * Get user notifications
 * GET /api/user/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      isRead: req.query.isRead,
      type: req.query.type,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await notificationService.getNotifications(
      userId,
      "user",
      filters,
    );

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
 * GET /api/user/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const count = await notificationService.getUnreadCount(userId, "user");

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
 * PUT /api/user/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const io = req.app.get("io"); // Get socket.io instance from app

    const notification = await notificationService.markAsRead(
      id,
      userId,
      "user",
      io,
    );

    return res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/user/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const io = req.app.get("io");

    const result = await notificationService.markAllAsRead(userId, "user", io);

    return res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/user/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const io = req.app.get("io");

    await notificationService.deleteNotification(id, userId, "user", io);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 * DELETE /api/user/notifications/read-all
 */
export const deleteAllRead = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const io = req.app.get("io");

    const result = await notificationService.deleteAllRead(userId, "user", io);

    return res.status(200).json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: "All read notifications deleted",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register FCM token
 * POST /api/user/notifications/register-token
 */
export const registerFCMToken = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    const userId =
      req.user._id ||
      req.user.userId ||
      req.user.id ||
      req.user.adminId ||
      req.user.vendorId;
    const userRole = req.user.role || "user";
    const { fcmToken, deviceInfo, platform } = req.body;

    console.log(`Registration attempt for ${userRole} ${userId}:`, {
      fcmToken: fcmToken ? `${fcmToken.substring(0, 10)}...` : "missing",
      deviceInfo,
      platform,
    });

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    // Map role to userModel
    let userModel = "User";
    if (userRole === "admin") userModel = "Admin";
    else if (userRole === "vendor") userModel = "Vendor";
    else if (userRole === "delivery_partner") userModel = "DeliveryPartner";

    // Handle platform parameter (simpler API)
    let finalDeviceInfo = deviceInfo || {};

    if (platform) {
      // If platform is provided, map it to deviceType
      if (platform === "mobile" || platform === "app") {
        finalDeviceInfo.deviceType = "android"; // Default mobile to android
      } else if (platform === "web") {
        finalDeviceInfo.deviceType = "web";
      }
    }

    const device = await firebaseService.registerFCMToken(
      userId,
      fcmToken,
      finalDeviceInfo,
      userModel,
    );

    res.status(200).json({
      success: true,
      message: "FCM token registered successfully",
      data: { device },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unregister FCM token
 * POST /api/user/notifications/unregister-token
 */
export const unregisterFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    await firebaseService.unregisterFCMToken(fcmToken);

    res.status(200).json({
      success: true,
      message: "FCM token unregistered successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send test notification
 * POST /api/user/notifications/test
 */
export const sendTestNotification = async (req, res, next) => {
  try {
    const userId =
      req.user._id ||
      req.user.userId ||
      req.user.id ||
      req.user.adminId ||
      req.user.vendorId;
    const userRole = req.user.role || "user";
    const {
      title = "Test Notification",
      message = "This is a test notification from NearGud",
    } = req.body;

    // Map role to userModel
    let userModel = "User";
    if (userRole === "admin") userModel = "Admin";
    else if (userRole === "vendor") userModel = "Vendor";
    else if (userRole === "delivery_partner") userModel = "DeliveryPartner";

    const result = await firebaseService.sendPushNotification({
      userId,
      title,
      message,
      type: "test",
      priority: "high",
      userModel,
    });

    res.status(200).json({
      success: true,
      message: "Test notification sent",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
