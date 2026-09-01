import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { listPlatformUsers } from '@libs/platform/admin'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const users = await listPlatformUsers()

  return NextResponse.json({ ok: true, users })
}
