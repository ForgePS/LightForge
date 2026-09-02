import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lightforge-2cf3b'
const databaseId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || 'lightforge'
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  `${projectId}.firebasestorage.app`

export function getStorageBucketName() {
  return storageBucket
}

function initAdminApp(): App {
  if (getApps().length) {
    return getApps()[0]!
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
      projectId,
      storageBucket
    })
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket
  })
}

const app = initAdminApp()

export const adminAuth: Auth = getAuth(app)
export const adminDb: Firestore = getFirestore(app, databaseId)
export const adminStorage: Storage = getStorage(app)
