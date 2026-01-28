import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// TODO: Replace with your actual Firebase project configuration
// Get these from Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
if (!firebaseConfig.projectId) {
  console.error(
    "❌ Firebase Error: projectId is missing. Please check your environment variables (VITE_FIREBASE_PROJECT_ID).",
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

// VAPID Key for Web Push (Get from Cloud Messaging tab -> Web configuration)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export { messaging, app, analytics };
