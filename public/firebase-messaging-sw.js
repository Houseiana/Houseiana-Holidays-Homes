importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyB1y5n6inyry64tc97L-A8FyYRoi70n674",
    authDomain: "houseiana.firebaseapp.com",
    projectId: "houseiana",
    storageBucket: "houseiana.firebasestorage.app",
    messagingSenderId: "597487321302",
    appId: "1:597487321302:web:cf871f4aa7a17fa79e0977"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        // icon: '/logo.png' // Icon not found, removing to avoid errors
        requireInteraction: true,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
