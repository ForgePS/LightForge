import { NextResponse } from 'next/server'

import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export async function GET() {
  const ctx = await getPortalSessionFromCookie()

  if (!ctx) {
    return NextResponse.json({ error: 'Portal session expired' }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    session: {
      id: ctx.session.id,
      assuranceLevel: ctx.session.assuranceLevel,
      expiresAt: ctx.session.expiresAt,
      idleExpiresAt: ctx.session.idleExpiresAt
    },
    portal: {
      id: ctx.portal.id,
      shortCode: ctx.portal.shortCode,
      status: ctx.portal.status
    }
  })
}
