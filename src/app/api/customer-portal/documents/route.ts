import { NextResponse } from 'next/server'

import { listPortalDocuments } from '@libs/customer-portal/documents'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const data = await listPortalDocuments(session)

    return NextResponse.json({ ok: true, ...data })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
