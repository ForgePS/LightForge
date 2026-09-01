import { NextResponse } from 'next/server'

import { adminAuth } from '@libs/firebase/admin'
import { getSessionUser } from '@libs/auth/session'
import { provisionTrialTenant } from '@libs/tenants/provision'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const idToken = body?.idToken as string | undefined
    const companyName = body?.companyName as string | undefined
    const displayName = (body?.displayName as string | undefined)?.trim()

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    const email = decoded.email

    if (!email) {
      return NextResponse.json({ error: 'Authenticated user has no email' }, { status: 400 })
    }

    const existing = await getSessionUser()

    // Prefer freshly verified token identity for provisioning
    const tenant = await provisionTrialTenant({
      uid: decoded.uid,
      email,
      displayName: displayName || decoded.name || email.split('@')[0] || 'User',
      companyName
    })

    return NextResponse.json({
      ok: true,
      tenant,
      alreadyHadSession: Boolean(existing)
    })
  } catch (error) {
    console.error('provision failed', error)

    return NextResponse.json({ error: 'Unable to provision trial tenant' }, { status: 500 })
  }
}
