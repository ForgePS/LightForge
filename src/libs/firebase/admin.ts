import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lightforge-2cf3b'
const databaseId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || 'lightforge'

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
      projectId
    })
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId
  })
}

const app = initAdminApp()

export const adminAuth: Auth = getAuth(app)
export const adminDb: Firestore = getFirestore(app, databaseId)
