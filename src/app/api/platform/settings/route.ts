import { NextResponse } from 'next/server'

import { getPlatformSettings, updatePlatformSettings } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const settings = await getPlatformSettings()

  return NextResponse.json({ ok: true, settings })
}

export async function PUT(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const body = await request.json()
  const settings = await updatePlatformSettings(body)

  return NextResponse.json({ ok: true, settings })
}
