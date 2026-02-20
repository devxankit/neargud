import admin from "firebase-admin";
import Notification from "../models/Notification.model.js";
import UserDevice from "../models/UserDevice.model.js";

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        console.log("✅ Firebase Admin already initialized");
        this.initialized = true;
        return;
      }

      // Initialize with service account (if provided)
      let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (serviceAccountPath) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        console.log("✅ Firebase Admin initialized with service account file");
        this.initialized = true;
      } else if (serviceAccount) {
        let parsedServiceAccount;
        try {
          // Try to parse directly first (in case it's raw JSON)
          parsedServiceAccount = JSON.parse(serviceAccount);
        } catch (e) {
          // capturing error means it might be Base64 encoded or invalid
          try {
            const decodedStr = Buffer.from(serviceAccount, "base64").toString(
              "utf8",
            );
            parsedServiceAccount = JSON.parse(decodedStr);
            console.log("✅ Firebase key decoded from Base64");
          } catch (e2) {
            console.error(
              "❌ Failed to parse Firebase key (neither JSON nor Base64)",
            );
          }
        }

        if (parsedServiceAccount) {
          admin.initializeApp({
            credential: admin.credential.cert(parsedServiceAccount),
          });
          console.log(
            "✅ Firebase Admin initialized with service account JSON",
          );
          this.initialized = true;
        }
      } else {
        console.warn("⚠️  Firebase service account not configured");
        console.warn(
          "⚠️  Add FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY to your .env file",
        );
        console.warn("⚠️  Push notifications will not work until configured");
      }
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin:", error.message);
    }
  }

  /**
   * Send push notification to a user
   * @param {Object} params - Notification parameters
   * @returns {Promise<Object>} - Send result
   */
  async sendPushNotification({
    userId,
    userModel = "User",
    title,
    message,
    data = {},
    type = "general",
    priority = "medium",
    clickAction = null,
  }) {
    try {
      if (!this.initialized) {
        console.warn("Firebase not initialized. Skipping push notification.");
        // Still save notification to database
        await this.saveNotificationToDb({
          userId,
          userModel,
          title,
          message,
          data,
          type,
          priority,
          clickAction,
          sentViaPush: false,
        });
        return { success: false, error: "Firebase not initialized" };
      }

      // Get user's FCM tokens
      const devices = await UserDevice.find({
        userId,
        userModel,
        isActive: true,
      });

      if (!devices || devices.length === 0) {
        console.log(`No active devices found for user: ${userId}`);
        // Save notification to database
        await this.saveNotificationToDb({
          userId,
          userModel,
          title,
          message,
          data,
          type,
          priority,
          clickAction,
          sentViaPush: false,
        });
        return { success: false, error: "No active devices" };
      }

      const tokens = devices.map((d) => d.fcmToken);

      // Prepare FCM message
      const fcmMessage = {
        notification: {
          title,
          body: message,
        },
        data: {
          ...data,
          type,
          priority,
          clickAction: clickAction || "",
          timestamp: new Date().toISOString(),
        },
        tokens,
        android: {
          priority:
            priority === "urgent" || priority === "high" ? "high" : "normal",
          notification: {
            sound: "default",
            channelId: "neargud_notifications",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: "/logo192.png",
            badge: "/badge.png",
            requireInteraction: priority === "urgent",
          },
        },
      };

      // Send notification
      const response = await admin.messaging().sendEachForMulticast(fcmMessage);

      console.log(
        `✅ Push notification sent: ${response.successCount}/${tokens.length} devices`,
      );

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${idx}:`, resp.error);
          }
        });

        // Deactivate failed tokens
        await UserDevice.updateMany(
          { fcmToken: { $in: failedTokens } },
          { $set: { isActive: false } },
        );
      }

      // Save notification to database
      const notification = await this.saveNotificationToDb({
        userId,
        userModel,
        title,
        message,
        data,
        type,
        priority,
        clickAction,
        sentViaPush: true,
        pushSentAt: new Date(),
        pushDelivered: response.successCount > 0,
        fcmMessageId: response.responses[0]?.messageId || null,
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Error sending push notification:", error);

      // Save notification to database even if push fails
      await this.saveNotificationToDb({
        userId,
        userModel,
        title,
        message,
        data,
        type,
        priority,
        clickAction,
        sentViaPush: false,
        pushError: error.message,
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Save notification to database
   */
  async saveNotificationToDb(notificationData) {
    try {
      // Map userModel to recipientType (matching Notification model enum)
      const modelToTypeMap = {
        User: "user",
        Vendor: "vendor",
        Admin: "admin",
        DeliveryPartner: "delivery_partner",
      };

      const notification = new Notification({
        recipientId: notificationData.userId,
        recipientType:
          modelToTypeMap[notificationData.userModel] ||
          notificationData.userModel?.toLowerCase() ||
          "user",
        recipientTypeModel: notificationData.userModel || "User",
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority,
        actionUrl: notificationData.clickAction,
        metadata: notificationData.data || {},
        sentViaPush: notificationData.sentViaPush || false,
        pushSentAt: notificationData.pushSentAt,
        pushDelivered: notificationData.pushDelivered || false,
        pushError: notificationData.pushError,
        fcmMessageId: notificationData.fcmMessageId,
      });

      await notification.save();
      console.log("✅ Notification saved to database");
      return notification;
    } catch (error) {
      console.error("Error saving notification to database:", error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotifications(users, notificationData) {
    const results = [];

    for (const user of users) {
      const result = await this.sendPushNotification({
        userId: user.userId || user._id,
        userModel: user.userModel || "User",
        ...notificationData,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Register FCM token for a user
   */
  async registerFCMToken(
    userId,
    fcmToken,
    deviceInfo = {},
    userModel = "User",
  ) {
    try {
      // Ensure deviceInfo is an object
      const safeDeviceInfo =
        typeof deviceInfo === "object" && deviceInfo !== null ? deviceInfo : {};

      // Determine device type (default to 'web' if not specified)
      const deviceType = safeDeviceInfo.deviceType || "web";
      const isMobile = deviceType === "android" || deviceType === "ios";

      console.log(
        `📱 Registering ${deviceType} FCM token for ${userModel} ${userId}`,
      );

      // Check if token already exists in UserDevice
      let device = await UserDevice.findOne({ fcmToken });

      if (device) {
        // Update existing device
        device.userId = userId;
        device.userModel = userModel;
        device.isActive = true;
        device.lastUsed = new Date();
        device.deviceInfo = { ...device.deviceInfo, ...safeDeviceInfo };
        await device.save();
      } else {
        // Create new device
        device = new UserDevice({
          userId,
          userModel,
          fcmToken,
          deviceInfo: safeDeviceInfo,
          isActive: true,
        });
        await device.save();
      }

      // STRICT SOP COMPLIANCE: Also update the specific model directly
      let Model;
      if (userModel === "Admin") {
        Model = (await import("../models/Admin.model.js")).default;
      } else if (userModel === "Vendor") {
        Model = (await import("../models/Vendor.model.js")).default;
      } else if (userModel === "DeliveryPartner") {
        Model = (await import("../models/DeliveryPartner.model.js")).default;
      } else {
        Model = (await import("../models/User.model.js")).default;
      }

      // Store token in the correct array based on device type
      if (isMobile) {
        // Mobile token (Android or iOS)
        await Model.findByIdAndUpdate(userId, {
          $addToSet: { fcmTokenMobile: fcmToken }, // Add to mobile array
        });
        console.log(
          `✅ Mobile FCM token registered in ${userModel}.fcmTokenMobile for ID: ${userId}`,
        );
      } else {
        // Web token
        await Model.findByIdAndUpdate(userId, {
          $addToSet: { fcmTokens: fcmToken }, // Add to web array
        });
        console.log(
          `✅ Web FCM token registered in ${userModel}.fcmTokens for ID: ${userId}`,
        );
      }

      console.log(
        `✅ FCM token registered in UserDevice collection: ${fcmToken.substring(0, 10)}...`,
      );
      return device;
    } catch (error) {
      console.error("Error registering FCM token:", error);
      throw error;
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterFCMToken(fcmToken) {
    try {
      await UserDevice.updateOne({ fcmToken }, { $set: { isActive: false } });

      // STRICT SOP COMPLIANCE: Also remove from User model
      const User = (await import("../models/User.model.js")).default;
      // Remove from both web and mobile token arrays
      await User.updateMany(
        { $or: [{ fcmTokens: fcmToken }, { fcmTokenMobile: fcmToken }] },
        {
          $pull: {
            fcmTokens: fcmToken,
            fcmTokenMobile: fcmToken,
          },
        },
      );

      console.log("✅ FCM token unregistered from all arrays");
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FirebaseService();
