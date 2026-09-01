import { NextResponse } from 'next/server'

import { listTenantTemplates } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const templates = await listTenantTemplates()

  return NextResponse.json({ ok: true, templates })
}
