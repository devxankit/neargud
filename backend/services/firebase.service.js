import admin from 'firebase-admin';
import Notification from '../models/Notification.model.js';
import UserDevice from '../models/UserDevice.model.js';

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
                console.log('✅ Firebase Admin already initialized');
                this.initialized = true;
                return;
            }




            // Initialize with service account (if provided)
            let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

            if (serviceAccount) {
                let parsedServiceAccount;
                try {
                    // Try to parse directly first (in case it's raw JSON)
                    parsedServiceAccount = JSON.parse(serviceAccount);
                } catch (e) {
                    // capturing error means it might be Base64 encoded or invalid
                    try {
                        const decodedStr = Buffer.from(serviceAccount, "base64").toString("utf8");
                        parsedServiceAccount = JSON.parse(decodedStr);
                        console.log('✅ Firebase key decoded from Base64');
                    } catch (e2) {
                        console.error('❌ Failed to parse Firebase key (neither JSON nor Base64)');
                    }
                }

                if (parsedServiceAccount) {
                    admin.initializeApp({
                        credential: admin.credential.cert(parsedServiceAccount),
                    });
                    console.log('✅ Firebase Admin initialized with service account');
                    this.initialized = true;
                }
            } else {
                console.warn('⚠️  Firebase service account not configured');
                console.warn('⚠️  Add FIREBASE_SERVICE_ACCOUNT_KEY to your .env file');
                console.warn('⚠️  Push notifications will not work until configured');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Admin:', error.message);
        }
    }

    /**
     * Send push notification to a user
     * @param {Object} params - Notification parameters
     * @returns {Promise<Object>} - Send result
     */
    async sendPushNotification({
        userId,
        userModel = 'User',
        title,
        message,
        data = {},
        type = 'general',
        priority = 'medium',
        clickAction = null,
    }) {
        try {
            if (!this.initialized) {
                console.warn('Firebase not initialized. Skipping push notification.');
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
                return { success: false, error: 'Firebase not initialized' };
            }

            // Get user's FCM tokens
            const devices = await UserDevice.find({
                userId,
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
                return { success: false, error: 'No active devices' };
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
                    clickAction: clickAction || '',
                    timestamp: new Date().toISOString(),
                },
                tokens,
                android: {
                    priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal',
                    notification: {
                        sound: 'default',
                        channelId: 'neargud_notifications',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
                webpush: {
                    notification: {
                        icon: '/logo192.png',
                        badge: '/badge.png',
                        requireInteraction: priority === 'urgent',
                    },
                },
            };

            // Send notification
            const response = await admin.messaging().sendEachForMulticast(fcmMessage);

            console.log(`✅ Push notification sent: ${response.successCount}/${tokens.length} devices`);

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
                    { $set: { isActive: false } }
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
            console.error('Error sending push notification:', error);

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
            const notification = new Notification({
                recipientId: notificationData.userId,
                recipientType: notificationData.userModel?.toLowerCase() || 'user',
                recipientTypeModel: notificationData.userModel || 'User',
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
            console.log('✅ Notification saved to database');
            return notification;
        } catch (error) {
            console.error('Error saving notification to database:', error);
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
                userModel: user.userModel || 'User',
                ...notificationData,
            });
            results.push(result);
        }

        return results;
    }

    /**
     * Register FCM token for a user
     */
    async registerFCMToken(userId, fcmToken, deviceInfo = {}) {
        try {
            // Check if token already exists
            let device = await UserDevice.findOne({ fcmToken });

            if (device) {
                // Update existing device
                device.userId = userId;
                device.isActive = true;
                device.lastUsed = new Date();
                device.deviceInfo = { ...device.deviceInfo, ...deviceInfo };
                await device.save();
            } else {
                // Create new device
                device = new UserDevice({
                    userId,
                    fcmToken,
                    deviceInfo,
                    isActive: true,
                });
                await device.save();
            }

            console.log(`✅ FCM token registered for user: ${userId}`);
            return device;
        } catch (error) {
            console.error('Error registering FCM token:', error);
            throw error;
        }
    }

    /**
     * Unregister FCM token
     */
    async unregisterFCMToken(fcmToken) {
        try {
            await UserDevice.updateOne(
                { fcmToken },
                { $set: { isActive: false } }
            );
            console.log('✅ FCM token unregistered');
        } catch (error) {
            console.error('Error unregistering FCM token:', error);
            throw error;
        }
    }
}

// Export singleton instance
export default new FirebaseService();
