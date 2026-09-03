import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { getAdminPortalSummary } from '@libs/customer-portal/admin'

type Params = { params: Promise<{ customerId: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const ctx = await requireActiveTenantContext()
    const { customerId } = await params
    const summary = await getAdminPortalSummary(ctx.tenantId, customerId)

    return NextResponse.json({ ok: true, ...summary })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
