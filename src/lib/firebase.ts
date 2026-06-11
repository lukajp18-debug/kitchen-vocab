import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// ============================================================
// Firebase client configuration (project: luka-study-2026)
// These values are PUBLIC by design — Firebase exposes them in the
// console snippet. Real security is enforced by Firestore rules, not by
// hiding this config. Env vars override the hardcoded fallbacks so the
// app keeps working even if Vercel env vars are missing/empty.
// ============================================================
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || 'AIzaSyCMqpR7YfNI_rB1DOjbRMOAJcC_vBNSWoA',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || 'luka-study-2026.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || 'luka-study-2026',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || 'luka-study-2026.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '612101776452',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || '1:612101776452:web:a10ed5d0b21cd3f4ecc811',
}

// Avoid re-initializing on hot reloads in Next.js dev mode
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)
export default app
