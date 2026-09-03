import { NextResponse } from 'next/server'

import { getPortalThread, replyPortalThread } from '@libs/customer-portal/messaging'
import { requirePortalSession } from '@libs/customer-portal/session'

type Params = { params: Promise<{ publicNumber: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const { publicNumber } = await params
    const thread = await getPortalThread(session, publicNumber)

    return NextResponse.json({ ok: true, thread })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const { publicNumber } = await params
    const body = await request.json()
    const thread = await replyPortalThread(session, publicNumber, String(body.body || ''))

    return NextResponse.json({ ok: true, thread })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
