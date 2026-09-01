import { NextResponse } from 'next/server'

import { createSessionCookie, getSessionUser } from '@libs/auth/session'
import { ensureUserProfile } from '@libs/tenants/provision'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const idToken = body?.idToken as string | undefined

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    await createSessionCookie(idToken)

    const user = await getSessionUser()

    if (user) {
      await ensureUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      })
    }

    return NextResponse.json({ ok: true, user })
  } catch (error) {
    console.error('session login failed', error)

    return NextResponse.json({ error: 'Unable to create session' }, { status: 401 })
  }
}
