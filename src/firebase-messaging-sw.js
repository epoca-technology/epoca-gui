// Angular SW
importScripts('ngsw-worker.js');

// Messaging SW
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');
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

