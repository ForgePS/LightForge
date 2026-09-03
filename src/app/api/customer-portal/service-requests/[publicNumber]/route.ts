import { NextResponse } from 'next/server'

import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalServiceRequest } from '@libs/customer-portal/serviceRequests'
import { requirePortalSession } from '@libs/customer-portal/session'

type Params = { params: Promise<{ publicNumber: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.serviceRequests) {
      return NextResponse.json({ error: 'Service requests are not available' }, { status: 403 })
    }

    const { publicNumber } = await params
    const request = await getPortalServiceRequest(session, publicNumber)

    return NextResponse.json({ ok: true, request })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
