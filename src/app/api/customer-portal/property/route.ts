import { NextResponse } from 'next/server'

import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { listPortalProperty, requestPortalPropertyChange } from '@libs/customer-portal/property'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.propertyInformation) {
      return NextResponse.json({ error: 'Property information is not available' }, { status: 403 })
    }

    const data = await listPortalProperty(session)

    return NextResponse.json({ ok: true, ...data })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()
    const body = await request.json()
    const result = await requestPortalPropertyChange(session, {
      field: String(body.field || ''),
      value: String(body.value || ''),
      note: body.note ? String(body.note) : undefined
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
