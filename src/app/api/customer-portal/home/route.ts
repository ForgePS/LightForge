import { NextResponse } from 'next/server'

import { buildPortalHomeDto } from '@libs/customer-portal/home'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const ctx = await requirePortalSession()
    const home = await buildPortalHomeDto(ctx.tenantId, ctx.portal)

    return NextResponse.json({ ok: true, home })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load portal' },
      { status }
    )
  }
}
