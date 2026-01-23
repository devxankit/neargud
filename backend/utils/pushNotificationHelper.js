import firebaseService from '../services/firebase.service.js';
import User from '../models/User.model.js';

/**
 * Send notification to a specific user
 * @param {string} userId - User ID
 * @param {Object} payload - Notification payload { title, body, data }
 * @param {boolean} includeMobile - Whether to include mobile tokens
 */
async function sendNotificationToUser(userId, payload, includeMobile = true) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Use the existing firebaseService which handles device lookups and sending
        // We Map strict SOP payload to firebaseService's expected format
        const response = await firebaseService.sendPushNotification({
            userId,
            title: payload.title,
            message: payload.body,
            data: payload.data,
            type: payload.data?.type || 'general',
            userModel: 'User'
        });

        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        // Don't throw - notifications are non-critical
    }
}

export { sendNotificationToUser };
