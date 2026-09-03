import { NextResponse } from 'next/server'

import { getPortalInvoice } from '@libs/customer-portal/billing'
import { requirePortalSession } from '@libs/customer-portal/session'

type Params = { params: Promise<{ publicNumber: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const { publicNumber } = await params
    const invoice = await getPortalInvoice(session, publicNumber)

    return NextResponse.json({ ok: true, invoice })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
