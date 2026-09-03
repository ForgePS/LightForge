import { NextResponse } from 'next/server'

import { getPortalLighting } from '@libs/customer-portal/lighting'
import { requirePortalSession } from '@libs/customer-portal/session'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.myLighting) {
      return NextResponse.json({ error: 'My Lighting is not available' }, { status: 403 })
    }

    const lighting = await getPortalLighting(session)

    return NextResponse.json({ ok: true, lighting })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
