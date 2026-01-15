importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyBdQWzQhL3fJhQqUXc9Ut8ldS40kiw7vig",
    authDomain: "neargud-820b7.firebaseapp.com",
    projectId: "neargud-820b7",
    storageBucket: "neargud-820b7.firebasestorage.app",
    messagingSenderId: "825375443746",
    appId: "1:825375443746:web:2867009c9cd7c2e60af37b"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
