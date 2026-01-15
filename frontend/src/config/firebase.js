import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// TODO: Replace with your actual Firebase project configuration
// Get these from Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyBdQWzQhL3fJhQqUXc9Ut8ldS40kiw7vig",
  authDomain: "neargud-820b7.firebaseapp.com",
  projectId: "neargud-820b7",
  storageBucket: "neargud-820b7.firebasestorage.app",
  messagingSenderId: "825375443746",
  appId: "1:825375443746:web:2867009c9cd7c2e60af37b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID Key for Web Push (Get from Cloud Messaging tab -> Web configuration)
export const VAPID_KEY = "BMnW74tc3blHqdZv40OT8XRAbDUyZBZfoaznYav8MkV-afz46VB47C2BUBTTI9NrGmAsiqrNsji-CtCCU9AR9EQ";

export { messaging, app };
