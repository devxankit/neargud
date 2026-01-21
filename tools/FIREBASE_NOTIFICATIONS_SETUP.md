# Firebase Cloud Messaging (FCM) Push Notifications - Implementation Guide

## ✅ Complete Firebase Integration

Firebase push notifications have been integrated into your NearGud application with database storage and auto-notifications.

## 📋 Features Implemented

### Backend:
1. **Firebase Admin SDK Integration** ✅
2. **Notification Database Model** (with FCM tracking) ✅
3. **User Device Management** (FCM Token storage) ✅
4. **Notification Helper Service** (Pre-built templates) ✅
5. **Auto-notifications on orders** ✅

### Notification Types:
- 🎉 Order Placed
- ✅ Order Confirmed
- 💳 Payment Success
- ❌ Payment Failed
- 🚚 Order Shipped
- 🎊 Order Delivered
- ❌ Order Cancelled
- 🔔 New Order (for Vendors)
- 💬 Chat Messages

## 🔧 Setup Required

### Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Cloud Messaging** in the project settings
4. Generate a **Service Account Key**:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

### Step 2: Backend Configuration

Add to `backend/.env`:

```env
# Firebase Cloud Messaging
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
```

**Note**: The entire JSON content should be on ONE line in .env file

### Step 3: Frontend Setup

1. **Install Firebase SDK** (already installed):
```bash
npm install firebase
```

2. **Create Firebase Config** - `frontend/src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

3. **Create `firebase-messaging-sw.js`** in `public/` folder:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    tag: payload.data.type || 'notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

4. **Request Permission and Get Token**:

Create `frontend/src/utils/notification.js`:

```javascript
import { messaging, getToken, onMessage } from '../config/firebase';
import { registerFCMToken } from '../services/notificationApi';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console → Cloud Messaging → Web Push certificates
      });
      
      if (token) {
        console.log('FCM Token:', token);
        
        // Send token to backend
        await registerFCMToken(token, {
          deviceType: 'web',
          browser: navigator.userAgent,
        });
        
        return token;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const setupForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show notification in app
    if (Notification.permission === 'granted') {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo192.png',
        tag: payload.data.type
      });
    }
  });
};
```

5. **Setup in App Component**:

```javascript
import { useEffect } from 'react';
import { requestNotificationPermission, setupForegroundNotifications } from './utils/notification';

function App() {
  useEffect(() => {
    // Request permission when app loads (for logged in users)
    if (isAuthenticated) {
      requestNotificationPermission();
      setupForegroundNotifications();
    }
  }, [isAuthenticated]);

  return (
    // Your app components
  );
}
```

## 📡 API Endpoints

### Get Notifications
```
GET /api/user/notifications?page=1&limit=20&unreadOnly=false
```

### Mark as Read
```
PUT /api/user/notifications/:id/read
```

### Mark All as Read
```
PUT /api/user/notifications/read-all
```

### Get Unread Count
```
GET /api/user/notifications/unread-count
```

### Register FCM Token
```
POST /api/user/notifications/register-token
Body: {
  "fcmToken": "firebase_token_here",
  "deviceInfo": {
    "deviceType": "web",
    "browser": "Chrome"
  }
}
```

### Unregister FCM Token
```
POST /api/user/notifications/unregister-token
Body: {
  "fcmToken": "firebase_token_here"
}
```

## 🔔 Auto-Notifications

Notifications are automatically sent when:

1. **Order Created** → Customer gets "Order Placed" notification
2. **Payment Verified** → Customer gets:
   - "Payment Success" notification
   - "Order Confirmed" notification
3. **Order Status Changes** → Customer gets status update notification
4. **Order Shipped** → Customer gets tracking information
5. **Order Delivered** → Customer gets delivery confirmation
6. **Order Cancelled** → Customer gets cancellation notification

## 💾 Database Storage

All notifications are stored in MongoDB with:
- Title and message
- Type and priority
- Read status
- FCM tracking (sent, delivered, error)
- Related entity (order, payment, etc.)
- Click action URL

## 🧪 Testing Notifications

### Test Flow:
1. Place an order
2. Check notification appears in database
3. Check if FCM push notification was sent
4. Verify notification appears on device/browser

### Test without FCM:
Even without Firebase setup, notifications will:
- ✅ Be created in database
- ✅ Be accessible via API
- ❌ NOT send push notifications (logged as warning)

## 📱 Mobile Apps (Future)

The same Firebase setup works for:
- **React Native** apps
- **Flutter** apps
- **Native Android/iOS** apps

Just use platform-specific Firebase SDKs and register tokens the same way.

## 🔒 Security

- FCM tokens are stored securely in database
- Only authenticated users can register tokens
- Tokens are validated before sending notifications
- Invalid  tokens are automatically deactivated

## 🐛 Troubleshooting

### Notifications not sending?
1. Check if Firebase service account is configured
2. Verify FCM token is registered
3. Check backend logs for errors
4. Ensure user has granted notification permission

### Push not appearing?
1. Check service worker is registered
2. Verify VAPID key is correct
3. Check browser notification settings
4. Test in incognito mode

### Database notifications work but no push?
- This is normal if Firebase isn't configured
- Add FIREBASE_SERVICE_ACCOUNT_KEY to .env
- Restart backend server

## 📚 Documentation

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://firebase.google.com/docs/cloud-messaging/js/client)

## ✨ Next Steps

1. **Get Firebase credentials** from Firebase Console
2. **Add credentials** to backend/.env
3. **Configure frontend** with Firebase config
4. **Test notifications** by placing an order
5. **Customize notification templates** as needed

---

**Status**: ✅ **Backend Complete - Frontend Setup Required**
**Last Updated**: January 12, 2026
**Version**: 1.0.0
