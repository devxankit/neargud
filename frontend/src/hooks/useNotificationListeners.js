import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import socketService from "../utils/socket";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../store/authStore";

// Pages where notification count should be fetched
const NOTIFICATION_RELEVANT_PATHS = [
  '/app/profile',
  '/app/notifications',
  '/app/orders',
  '/profile',
  '/notifications',
  '/orders'
];

export const useNotificationListeners = () => {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const fetchUnreadCount = useNotificationStore(
    (state) => state.fetchUnreadCount,
  );
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    // Only proceed if user is logged in
    if (!token || !user) return;

    // Check if current path is relevant for notifications
    const isRelevantPath = NOTIFICATION_RELEVANT_PATHS.some(path =>
      location.pathname.startsWith(path)
    );

    // Ensure socket is connected for real-time updates
    const socket = socketService.connect(token);

    const handleNewNotification = (notification) => {
      console.log("🔔 New real-time notification received:", notification);
      addNotification(notification);
    };

    const handleNotificationRead = ({ notificationId }) => {
      // Only fetch count on relevant pages to avoid unnecessary API calls
      if (isRelevantPath) {
        fetchUnreadCount();
      }
    };

    if (socket) {
      // Listen for new notifications (always listen when logged in)
      socketService.onNewNotification(handleNewNotification);

      // Listen for notification read status updates
      socketService.onNotificationRead(handleNotificationRead);

      // Initial fetch of unread count - ONLY on relevant pages
      if (isRelevantPath) {
        fetchUnreadCount();
      }
    }

    return () => {
      if (socket) {
        socketService.off("new_notification", handleNewNotification);
        socketService.off("notification_read", handleNotificationRead);
      }
    };
  }, [token, user, location.pathname, addNotification, fetchUnreadCount]);
};
