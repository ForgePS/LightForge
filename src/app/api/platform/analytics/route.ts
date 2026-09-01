import { NextResponse } from 'next/server'

import { getPlatformAnalytics } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const analytics = await getPlatformAnalytics()

  return NextResponse.json({ ok: true, analytics })
}
