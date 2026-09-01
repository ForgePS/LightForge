import { NextResponse } from 'next/server'

import { getBillingOverview } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const billing = await getBillingOverview()

  return NextResponse.json({ ok: true, billing })
}
