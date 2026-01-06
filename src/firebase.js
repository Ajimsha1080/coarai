import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper to prevent crashing if env vars are missing during dev/build
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock_key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock_domain",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock_project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock_bucket",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock_sender",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock_app_id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
