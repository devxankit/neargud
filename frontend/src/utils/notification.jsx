import { getToken, onMessage } from 'firebase/messaging';
import { messaging, VAPID_KEY } from '../config/firebase';
import { registerFCMToken } from '../services/notificationApi';
import toast from 'react-hot-toast';

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted.');

            // Get FCM token
            // Explicitly register the service worker for better reliability
            let swRegistration;
            try {
                swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('FCM Service Worker registered');
            } catch (err) {
                console.error('FCM Service Worker registration failed:', err);
            }

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: swRegistration
            });

            if (token) {
                console.log('FCM Token:', token);

                // Register token with backend
                await registerFCMToken(token, {
                    deviceType: 'web',
                    browser: navigator.userAgent,
                    platform: navigator.platform
                });

                return token;
            }
        } else {
            console.log('Notification permission denied.');
        }
        return null;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('Foreground notification received:', payload);

            const { title, body } = payload.notification;

            // Display toast
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <img
                                    className="h-10 w-10 rounded-full"
                                    src={payload.notification.icon || '/logo192.png'}
                                    alt=""
                                />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {body}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ));

            resolve(payload);
        });
    });
