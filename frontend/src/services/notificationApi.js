import { registerFCMToken as unifiedRegister } from './pushNotificationService.jsx';

export const registerFCMToken = async (fcmToken, deviceInfo) => {
    // Redirect to unified service for better role handling
    return await unifiedRegister(true);
};

export const unregisterFCMToken = async (fcmToken) => {
    return await api.post('/user/notifications/unregister-token', {
        fcmToken
    });
};

export const getNotifications = async (params = {}) => {
    return await api.get('/user/notifications', { params });
};

export const markAsRead = async (id) => {
    return await api.put(`/user/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
    return await api.put('/user/notifications/read-all');
};

export const getUnreadCount = async () => {
    return await api.get('/user/notifications/unread-count');
};

export const sendTestNotification = async () => {
    return await api.post('/user/notifications/test', {
        title: 'Test Notification',
        message: 'This confirms your notification setup is working!'
    });
};

export const deleteNotification = async (id) => {
    return await api.delete(`/user/notifications/${id}`);
};

export const deleteAllRead = async () => {
    return await api.delete('/user/notifications/read-all');
};
