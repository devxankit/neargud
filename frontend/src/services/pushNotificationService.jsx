import { getToken, onMessage } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../config/firebase";
import api from "../utils/api";
import toast from "react-hot-toast";

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
    // Check if already registered in THIS SESSION (optional optimization)
    // Using sessionStorage for per-session registration to ensure backend sync
    const sessionRegistered = sessionStorage.getItem("fcm_registered_session");

    // Check localStorage for the actual token
    const savedToken = localStorage.getItem("fcm_token_web");

    if (savedToken && sessionRegistered && !forceUpdate) {
      console.log("FCM token already verified for this session");
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

    // Check for tokens to determine role if path is not enough
    const isAdmin = localStorage.getItem("admin-token");
    const isVendor = localStorage.getItem("vendor-token");
    const isUser = localStorage.getItem("user-token") || localStorage.getItem("token");

    if (path.startsWith("/admin") || isAdmin) {
      endpoint = "/admin/notifications/register-token";
    } else if (path.startsWith("/vendor") || isVendor) {
      endpoint = "/vendor/notifications/register-token";
    }

    // Only register if we have some form of auth token or explicit login context
    if (!isAdmin && !isVendor && !isUser) {
      console.log("No auth token found, skipping background registration");
      return null;
    }

    // Save to backend
    const response = await api.post(endpoint, {
      fcmToken: token,
      deviceInfo: {
        deviceType: "web",
        browser: navigator.userAgent,
      },
      platform: "web" // Added platform for backend mapping
    });

    if (response.success) {
      localStorage.setItem("fcm_token_web", token);
      sessionStorage.setItem("fcm_registered_session", "true");
      console.log("✅ FCM token registered with backend");
      return token;
    }
  } catch (error) {
    console.error("❌ Error registering FCM token:", error);
  }
}

// Setup foreground notification handler
function setupForegroundNotificationHandler(handler) {
  onMessage(messaging, (payload) => {
    console.log("📬 Foreground message received:", payload);

    const { title, body } = payload.notification;

    // Display a beautiful custom toast (system-like)
    toast.custom((t) => (
      <div
        className={`${t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-primary-500`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img
                className="h-10 w-10 rounded-full object-cover shadow-sm"
                src={payload.notification.icon || "/logo192.png"}
                alt=""
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{body}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-100">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-semibold text-primary-600 hover:text-primary-700 focus:outline-none uppercase tracking-wider">
            Close
          </button>
        </div>
      </div>
    ), { duration: 5000 });

    // Also trigger a system notification if permission granted (for "banner" effect)
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: body,
          icon: payload.notification.icon || "/logo192.png",
          tag: payload.data?.type || "general",
        });
      } catch (e) {
        console.warn("Could not show system notification banner", e);
      }
    }

    // Call custom handler (e.g. to update unread counts in store)
    if (handler) {
      handler(payload);
    }
  });
}

// Initialize push notifications
async function initializePushNotifications() {
  try {
    await registerServiceWorker();
    const hasPermission = await requestNotificationPermission();

    // If permission is already granted, try to register/verify token with backend
    if (hasPermission) {
      await registerFCMToken();
    }
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
