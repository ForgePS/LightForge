'use client'

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type User
} from 'firebase/auth'

import { auth } from '@libs/firebase/client'

async function createServerSession(user: User) {
  const idToken = await user.getIdToken()
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))

    throw new Error(data.error || 'Failed to create session')
  }
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)

  await createServerSession(credential.user)

  return credential.user
}

export async function registerWithEmail(input: {
  email: string
  password: string
  displayName: string
  companyName?: string
}) {
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password)

  if (input.displayName) {
    await updateProfile(credential.user, { displayName: input.displayName })
  }

  const idToken = await credential.user.getIdToken()
  const provisionRes = await fetch('/api/tenants/provision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      displayName: input.displayName,
      companyName: input.companyName
    })
  })

  if (!provisionRes.ok) {
    const data = await provisionRes.json().catch(() => ({}))

    throw new Error(data.error || 'Failed to provision trial tenant')
  }

  await createServerSession(credential.user)

  return credential.user
}

export async function requestPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  await auth.signOut().catch(() => undefined)
}
