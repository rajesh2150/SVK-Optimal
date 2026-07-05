import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDY6YQm5M2a0uuFGtK50YT5vQLpTyV656Y',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'svk-sweets.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'svk-sweets',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'svk-sweets.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '67034767497',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:67034767497:web:ffeebf5908a17bde19e658',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
);

export const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim() || '';

export { signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged };
