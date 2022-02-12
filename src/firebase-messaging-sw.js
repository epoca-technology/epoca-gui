// Angular SW
importScripts('ngsw-worker.js');

// Messaging SW
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');
firebase.initializeApp({
    apiKey: "AIzaSyAZd0yugAXBHLnC5MKu1oMhnFvvpZn94d0",
    authDomain: "projectplutus-prod.firebaseapp.com",
    projectId: "projectplutus-prod",
    storageBucket: "projectplutus-prod.appspot.com",
    messagingSenderId: "192265974678",
    appId: "1:192265974678:web:6d5ebd1518f7e73176e3b7"
});
let messaging;
try {
    // Initialize Firebase Instance
    messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        // Customize notification here
        const notificationTitle = payload.data.title;
        const notificationOptions = {
            body: payload.data.body,
            icon: './assets/img/fcm.png'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (e) {
    console.log('[ServiceWorker]: Platform does not support FCM.');
}
