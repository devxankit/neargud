import { create } from 'zustand';
import * as notificationApi from '../services/notificationApi';
import toast from 'react-hot-toast';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    // Fetch notifications
    fetchNotifications: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await notificationApi.getNotifications(params);
            const notificationsData = response.data.data || response.data;
            set({
                notifications: notificationsData.notifications || notificationsData,
                isLoading: false,
            });
            return notificationsData;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            const count = response.data.data?.count || response.data.count || 0;
            set({ unreadCount: count });
            return count;
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            return 0;
        }
    },

    // Mark as read
    markAsRead: async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId);

            // Update local state
            set((state) => ({
                notifications: state.notifications.map((notif) =>
                    notif._id === notificationId || notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            toast.error('Failed to mark as read');
            throw error;
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await notificationApi.markAllAsRead();

            // Update local state
            set((state) => ({
                notifications: state.notifications.map((notif) => ({
                    ...notif,
                    isRead: true,
                })),
                unreadCount: 0,
            }));

            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            await notificationApi.deleteNotification(notificationId);

            // Update local state
            set((state) => ({
                notifications: state.notifications.filter(
                    (notif) => notif._id !== notificationId && notif.id !== notificationId
                ),
            }));

            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
            throw error;
        }
    },

    // Delete all read
    deleteAllRead: async () => {
        try {
            await notificationApi.deleteAllRead();

            // Update local state
            set((state) => ({
                notifications: state.notifications.filter((notif) => !notif.isRead),
            }));

            toast.success('All read notifications deleted');
        } catch (error) {
            toast.error('Failed to delete notifications');
            throw error;
        }
    },
}));
