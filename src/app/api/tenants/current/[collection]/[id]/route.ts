import { NextResponse } from 'next/server'

import { deleteRecord, requireActiveTenantContext, updateRecord } from '@libs/modules/crud'
import { isValidCollection } from '@libs/modules/registry'

type Params = { params: Promise<{ collection: string; id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { collection, id } = await params
    const ctx = await requireActiveTenantContext()

    if (ctx.accessBlocked) {
      return NextResponse.json({ error: 'Tenant access blocked' }, { status: 403 })
    }

    if (!isValidCollection(collection)) {
      return NextResponse.json({ error: 'Unknown collection' }, { status: 400 })
    }

    const body = await request.json()
    const record = await updateRecord(ctx.tenantId, collection, id, body)

    return NextResponse.json({ ok: true, record })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update' },
      { status }
    )
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { collection, id } = await params
    const ctx = await requireActiveTenantContext()

    if (ctx.accessBlocked) {
      return NextResponse.json({ error: 'Tenant access blocked' }, { status: 403 })
    }

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Only owners/admins can delete' }, { status: 403 })
    }

    await deleteRecord(ctx.tenantId, collection, id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status }
    )
  }
}
