import { NextResponse } from 'next/server'

import {
  createRecord,
  listRecords,
  requireActiveTenantContext
} from '@libs/modules/crud'
import { isValidCollection } from '@libs/modules/registry'

type Params = { params: Promise<{ collection: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { collection } = await params
    const ctx = await requireActiveTenantContext()

    if (ctx.accessBlocked) {
      return NextResponse.json({ error: 'Tenant access blocked' }, { status: 403 })
    }

    if (!isValidCollection(collection)) {
      return NextResponse.json({ error: 'Unknown collection' }, { status: 400 })
    }

    const records = await listRecords(ctx.tenantId, collection)

    return NextResponse.json({ ok: true, records })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list' },
      { status }
    )
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { collection } = await params
    const ctx = await requireActiveTenantContext()

    if (ctx.accessBlocked) {
      return NextResponse.json({ error: 'Tenant access blocked' }, { status: 403 })
    }

    const body = await request.json()
    const record = await createRecord(ctx.tenantId, collection, body)

    return NextResponse.json({ ok: true, record })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create' },
      { status }
    )
  }
}
