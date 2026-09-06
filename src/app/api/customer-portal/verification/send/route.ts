import { NextResponse } from 'next/server'

import { enforcePortalRateLimit } from '@libs/customer-portal/rate-limit'
import { requirePortalSession } from '@libs/customer-portal/session'
import { sendPortalVerification } from '@libs/customer-portal/verification'

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()

    await enforcePortalRateLimit({
      key: `otp_send:${session.tenantId}:${session.session.id}`,
      limit: 8,
      windowMs: 15 * 60 * 1000
    })

    const body = await request.json()
    const result = await sendPortalVerification({
      purpose: body.purpose || 'step_up',
      channel: body.channel
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const retryAfterSeconds = (error as { retryAfterSeconds?: number }).retryAfterSeconds

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to send code',
        code: (error as { code?: string }).code,
        retryAfterSeconds
      },
      {
        status,
        headers: retryAfterSeconds ? { 'Retry-After': String(retryAfterSeconds) } : undefined
      }
    )
  }
}
