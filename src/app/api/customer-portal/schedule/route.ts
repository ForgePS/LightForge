import { NextResponse } from 'next/server'

import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalSchedule } from '@libs/customer-portal/schedule'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.schedule) {
      return NextResponse.json({ error: 'Schedule is not available' }, { status: 403 })
    }

    const schedule = await getPortalSchedule(session)

    return NextResponse.json({ ok: true, schedule })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
