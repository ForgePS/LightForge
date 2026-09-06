import { NextResponse } from 'next/server'

import { enforcePortalRateLimit } from '@libs/customer-portal/rate-limit'
import { requirePortalSession } from '@libs/customer-portal/session'
import { confirmPortalVerification, getVerificationStatus } from '@libs/customer-portal/verification'

export async function GET() {
  const status = await getVerificationStatus()

  if (!status) {
    return NextResponse.json({ error: 'Portal session expired' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, ...status })
}

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()

    await enforcePortalRateLimit({
      key: `otp_confirm:${session.tenantId}:${session.session.id}`,
      limit: 20,
      windowMs: 15 * 60 * 1000
    })

    const body = await request.json()
    const result = await confirmPortalVerification({
      verificationId: String(body.verificationId || ''),
      code: String(body.code || '')
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const retryAfterSeconds = (error as { retryAfterSeconds?: number }).retryAfterSeconds

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to verify code',
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
