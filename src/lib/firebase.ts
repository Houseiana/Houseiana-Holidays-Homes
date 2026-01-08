import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

// Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'undefined' &&
  firebaseConfig.projectId !== 'undefined'
);

let app: FirebaseApp | undefined = undefined;
let messaging: Messaging | undefined = undefined;
let initialized = false;

// Lazy initialization function
function initializeFirebase() {
  if (initialized) return;
  initialized = true;

  if (!isFirebaseConfigured) {
    console.warn('Firebase is not configured. Push notifications will be disabled.');
    return;
  }

  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Get messaging instance lazily
function getFirebaseMessaging(): Messaging | undefined {
  if (!isFirebaseConfigured) return undefined;

  initializeFirebase();

  if (!app) return undefined;

  if (!messaging && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.warn('Firebase messaging initialization failed:', error);
    }
  }

  return messaging;
}

// Only initialize on client side when needed
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  initializeFirebase();
}

export { app, messaging, getFirebaseMessaging, isFirebaseConfigured };
