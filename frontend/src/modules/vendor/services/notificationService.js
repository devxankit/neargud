import api from "../../../utils/api";

/**
 * Get vendor notifications
 * @param {Object} filters - { page, limit, isRead, type, search, sortBy, sortOrder }
 * @returns {Promise<Object>} Response object
 */
export const getNotifications = async (filters = {}) => {
    const response = await api.get('/vendor/notifications', { params: filters });
    return response;
};

/**
 * Get unread notification count
 * @returns {Promise<Object>} Response object
 */
export const getUnreadCount = async () => {
    const response = await api.get('/vendor/notifications/unread-count');
    return response;
};

/**
 * Mark notification as read
 * @param {String} id - Notification ID
 * @returns {Promise<Object>} Response object
 */
export const markAsRead = async (id) => {
    const response = await api.put(`/vendor/notifications/${id}/read`);
    return response;
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Response object
 */
export const markAllAsRead = async () => {
    const response = await api.put('/vendor/notifications/read-all');
    return response;
};

/**
 * Delete notification
 * @param {String} id - Notification ID
 * @returns {Promise<Object>} Response object
 */
export const deleteNotification = async (id) => {
    const response = await api.delete(`/vendor/notifications/${id}`);
    return response;
};

/**
 * Delete all read notifications
 * @returns {Promise<Object>} Response object
 */
export const deleteAllRead = async () => {
    const response = await api.delete('/vendor/notifications/read-all');
    return response;
};
