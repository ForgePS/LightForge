import { NextResponse } from 'next/server'

import { getPortalPaymentStatus, listPortalPayments } from '@libs/customer-portal/billing'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET(request: Request) {
  try {
    const session = await requirePortalSession()
    const url = new URL(request.url)
    const publicNumber = url.searchParams.get('invoice')
    const checkoutSessionId = url.searchParams.get('session_id')

    if (publicNumber) {
      const status = await getPortalPaymentStatus(session, publicNumber, checkoutSessionId)

      return NextResponse.json({ ok: true, ...status })
    }

    const data = await listPortalPayments(session)

    return NextResponse.json({ ok: true, ...data })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
