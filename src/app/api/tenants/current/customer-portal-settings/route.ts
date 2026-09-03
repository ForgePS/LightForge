import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { getTenantPortalSettings, setTenantPortalSettings } from '@libs/customer-portal/admin'
import { normalizePortalSettings } from '@libs/customer-portal/settings'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'

export async function GET() {
  try {
    const ctx = await requireActiveTenantContext()
    const settings = await getTenantPortalSettings(ctx.tenantId)

    return NextResponse.json({ ok: true, settings })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const patch = normalizePortalSettings({ ...(await getTenantPortalSettings(ctx.tenantId)), ...body })
    const settings = await setTenantPortalSettings(ctx.tenantId, patch)

    await writePortalAuditEvent({
      tenantId: ctx.tenantId,
      action: 'portal.settings_updated',
      actor: { type: 'staff', id: ctx.user.uid, email: ctx.user.email },
      metadata: { enabled: settings.enabled }
    })

    return NextResponse.json({ ok: true, settings })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
