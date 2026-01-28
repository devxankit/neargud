import { getToken, onMessage } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../config/firebase";
import api from "../utils/api";

// Register service worker
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      console.log("✅ Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      throw error;
    }
  } else {
    throw new Error("Service Workers are not supported");
  }
}

// Request notification permission
async function requestNotificationPermission() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("✅ Notification permission granted");
      return true;
    } else {
      console.log("❌ Notification permission denied");
      return false;
    }
  }
  return false;
}

// Get FCM token
async function getFCMToken() {
  try {
    const registration = await registerServiceWorker();

    // waiting for service worker to be active
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ FCM Token obtained:", token);
      return token;
    } else {
      console.log("❌ No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    // Don't throw, just return null so app doesn't crash
    return null;
  }
}

// Register FCM token with backend
async function registerFCMToken(forceUpdate = false) {
  try {
    // Check if already registered (optional optimization)
    const savedToken = localStorage.getItem("fcm_token_web");
    if (savedToken && !forceUpdate) {
      console.log("FCM token already registered locally");
      return savedToken;
    }

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log(
        "Notification permission not granted, skipping token registration",
      );
      return null;
    }

    // Get token
    const token = await getFCMToken();
    if (!token) {
      return null;
    }

    // Determine the correct endpoint based on the logged-in user context
    let endpoint = "/user/notifications/register-token";
    const path = window.location.pathname;

    if (path.startsWith("/admin") || localStorage.getItem("admin-token")) {
      endpoint = "/admin/notifications/register-token";
    } else if (
      path.startsWith("/vendor") ||
      localStorage.getItem("vendor-token")
    ) {
      endpoint = "/vendor/notifications/register-token";
    }

    // Save to backend
    const response = await api.post(endpoint, {
      fcmToken: token,
      deviceInfo: {
        deviceType: "web",
        browser: navigator.userAgent,
      },
    });

    if (response.success) {
      localStorage.setItem("fcm_token_web", token);
      console.log("✅ FCM token registered with backend");
      return token;
    }
  } catch (error) {
    console.error("❌ Error registering FCM token:", error);
    // Don't throw to avoid blocking main flow
  }
}

// Setup foreground notification handler
function setupForegroundNotificationHandler(handler) {
  onMessage(messaging, (payload) => {
    console.log("📬 Foreground message received:", payload);

    // Show notification (browser might block this if window is focused, so we can use custom UI or toast)
    // But for "system" style:
    if ("Notification" in window && Notification.permission === "granted") {
      // Note: new Notification() usually works in foreground only if specific logic allows,
      // but typically service worker handles background.
      // For foreground, we can show a Toast or just let the custom handler do it.
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || "/logo192.png",
        data: payload.data,
      });
    }

    // Call custom handler
    if (handler) {
      handler(payload);
    }
  });
}

// Initialize push notifications
async function initializePushNotifications() {
  try {
    await registerServiceWorker();
    // We don't necessarily ask for permission immediately on load,
    // better to wait for user action or login context, but SOP says initialize on load.
    requestNotificationPermission();
  } catch (error) {
    console.error("Error initializing push notifications:", error);
  }
}

export {
  initializePushNotifications,
  registerFCMToken,
  setupForegroundNotificationHandler,
  requestNotificationPermission,
};
