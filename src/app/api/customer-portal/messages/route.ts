import { NextResponse } from 'next/server'

import { createPortalThread, listPortalThreads } from '@libs/customer-portal/messaging'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const data = await listPortalThreads(session)

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
    const result = await createPortalThread(session, {
      subject: String(body.subject || 'Customer message'),
      body: String(body.body || '')
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
