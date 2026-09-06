import { NextResponse } from 'next/server'

import { createPortalInvoiceCheckout } from '@libs/customer-portal/billing'
import { enforcePortalRateLimit } from '@libs/customer-portal/rate-limit'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()

    await enforcePortalRateLimit({
      key: `pay_create:${session.tenantId}:${session.portal.customerId}`,
      limit: 10,
      windowMs: 15 * 60 * 1000
    })

    const body = await request.json()
    const publicNumber = String(body.publicInvoiceNumber || body.publicNumber || '')

    if (!publicNumber) {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 })
    }

    const result = await createPortalInvoiceCheckout(session, publicNumber, {
      idempotencyKey: body.idempotencyKey ? String(body.idempotencyKey) : undefined
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const retryAfterSeconds = (error as { retryAfterSeconds?: number }).retryAfterSeconds

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to start payment',
        code: (error as { code?: string }).code,
        requiredLevel: (error as { requiredLevel?: number }).requiredLevel,
        retryAfterSeconds
      },
      {
        status,
        headers: retryAfterSeconds ? { 'Retry-After': String(retryAfterSeconds) } : undefined
      }
    )
  }
}
