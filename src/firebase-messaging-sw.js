// Angular SW
importScripts('ngsw-worker.js');

// Messaging SW
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
firebase.initializeApp({
    apiKey: "AIzaSyBKcvKZTGo7hsYXreWpcpHuwo6UZff6Nfg",
    authDomain: "projectplutus-dev.firebaseapp.com",
    projectId: "projectplutus-dev",
    storageBucket: "projectplutus-dev.appspot.com",
    messagingSenderId: "228969576009",
    appId: "1:228969576009:web:7b516f6c4d248255177198"
});
let messaging;
try {
    // Initialize Firebase Instance
    messaging = firebase.messaging();

    // Default icon URL
    let defaultIcon = 'https://firebasestorage.googleapis.com/v0/b/projectplutus-prod.appspot.com/o/public%2Ffcm.png?alt=media&token=2fd0d0e1-ee6d-4f4f-b04d-891a4fa82bac';

    // Foreground
    messaging.onMessage((payload) => {
        // Log the notification for debugging
        console.log('[firebase-messaging-sw.js] Received a message ', payload);

        // Build the notification
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.image || defaultIcon
        };

        // Display it
        self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Background
    messaging.onBackgroundMessage((payload) => {
        // Log the notification for debugging
        console.log('[firebase-messaging-sw.js] Received a background message ', payload);

        // Build the notification
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.image || defaultIcon
        };

        // Display it
        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (e) {
    console.log('[ServiceWorker]: Platform does not support FCM.');
}

