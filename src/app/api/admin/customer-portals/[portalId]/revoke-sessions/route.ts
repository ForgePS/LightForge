import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { getPortalById, revokePortalSessions } from '@libs/customer-portal/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'

type Params = { params: Promise<{ portalId: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const ctx = await requireActiveTenantContext()
    const { portalId } = await params
    const portal = await getPortalById(ctx.tenantId, portalId)

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    const revoked = await revokePortalSessions(ctx.tenantId, portalId, ctx.user.uid, 'staff_revoke_sessions')

    await writePortalAuditEvent({
      tenantId: ctx.tenantId,
      portalId,
      customerId: portal.customerId,
      action: 'portal.sessions_revoked',
      actor: { type: 'staff', id: ctx.user.uid, email: ctx.user.email },
      metadata: { revoked }
    })

    return NextResponse.json({ ok: true, revoked })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
