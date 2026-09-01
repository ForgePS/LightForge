import { NextResponse } from 'next/server'

import { grantPlatformAdmin, listPlatformAdmins, revokePlatformAdmin } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const admins = await listPlatformAdmins()

  return NextResponse.json({ ok: true, admins })
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const body = await request.json()
  const email = String(body.email || '').trim()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const { adminAuth } = await import('@libs/firebase/admin')
    const user = await adminAuth.getUserByEmail(email)

    await grantPlatformAdmin(user.uid, email)

    const admins = await listPlatformAdmins()

    return NextResponse.json({ ok: true, admins })
  } catch {
    return NextResponse.json({ error: 'User not found in Firebase Auth' }, { status: 404 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const body = await request.json()
  const uid = String(body.uid || '').trim()

  if (!uid) {
    return NextResponse.json({ error: 'UID is required' }, { status: 400 })
  }

  if (uid === auth.user.uid) {
    return NextResponse.json({ error: 'You cannot revoke your own admin access' }, { status: 400 })
  }

  await revokePlatformAdmin(uid)

  const admins = await listPlatformAdmins()

  return NextResponse.json({ ok: true, admins })
}
