import { useEffect } from "react";
import socketService from "../utils/socket";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../store/authStore"; // Assuming there's an authStore

export const useNotificationListeners = () => {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const fetchUnreadCount = useNotificationStore(
    (state) => state.fetchUnreadCount,
  );
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    // Ensure socket is connected
    const socket = socketService.connect(token);

    if (socket) {
      // Listen for new notifications
      socketService.onNewNotification((notification) => {
        console.log("🔔 New real-time notification received:", notification);
        addNotification(notification);
      });

      // Listen for notification read status updates
      socketService.onNotificationRead(({ notificationId }) => {
        // You could update state here if needed, but usually the person
        // who reads it already updated their state via API call.
        // This is useful for multi-device sync.
        fetchUnreadCount();
      });

      // Initial fetch of unread count
      fetchUnreadCount();
    }

    // We don't disconnect here because socket is used globally
    // but we might want to cleanup listeners if this hook unmounts
    return () => {
      // socketService.offNewNotification(); // If we had an 'off' method
    };
  }, [token, addNotification, fetchUnreadCount]);
};
