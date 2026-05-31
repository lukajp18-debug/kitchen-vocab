import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// ============================================================
// Firebase Admin SDK — only runs on the server (API routes)
// ============================================================

let adminApp: App

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // Build the service account from individual env vars
  // (avoids needing to paste a JSON file into the environment)
  adminApp = initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      // The private key comes Base64-encoded in env vars to avoid newline issues
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })

  return adminApp
}

export const adminAuth    = getAuth(getAdminApp())
export const adminDb      = getFirestore(getAdminApp())
export const adminStorage = getStorage(getAdminApp())
