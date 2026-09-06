import { NextResponse } from 'next/server'

import { clientIpFromRequest, enforcePortalRateLimit } from '@libs/customer-portal/rate-limit'
import { exchangeGrantToken } from '@libs/customer-portal/session'

export async function POST(request: Request) {
  try {
    await enforcePortalRateLimit({
      key: `grant_exchange:${clientIpFromRequest(request)}`,
      limit: 20,
      windowMs: 15 * 60 * 1000
    })

    const body = await request.json()
    const shortCode = String(body.shortCode || '').trim()
    const grantToken = String(body.grantToken || body.token || '').trim()

    if (!shortCode || !grantToken) {
      return NextResponse.json({ error: 'Portal link is invalid or expired' }, { status: 400 })
    }

    const result = await exchangeGrantToken({ shortCode, grantToken })

    return NextResponse.json({
      ok: true,
      redirectTo: result.redirectTo,
      assuranceLevel: result.assuranceLevel
    })
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const retryAfterSeconds = (error as { retryAfterSeconds?: number }).retryAfterSeconds

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to open portal',
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
