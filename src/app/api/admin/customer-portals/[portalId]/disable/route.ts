import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { disableCustomerPortal, getPortalById } from '@libs/customer-portal/admin'

type Params = { params: Promise<{ portalId: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const ctx = await requireActiveTenantContext()
    const { portalId } = await params
    const existing = await getPortalById(ctx.tenantId, portalId)

    if (!existing) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    const portal = await disableCustomerPortal({
      tenantId: ctx.tenantId,
      portalId,
      actorUid: ctx.user.uid,
      actorEmail: ctx.user.email
    })

    return NextResponse.json({ ok: true, portal })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
