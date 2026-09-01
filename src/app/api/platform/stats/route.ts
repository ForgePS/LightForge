import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { getPlatformStats } from '@libs/platform/admin'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const stats = await getPlatformStats()

  return NextResponse.json({ ok: true, stats })
}
