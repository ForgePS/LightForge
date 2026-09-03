import { NextResponse } from 'next/server'

import { exchangeGrantToken } from '@libs/customer-portal/session'

export async function POST(request: Request) {
  try {
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

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to open portal' },
      { status }
    )
  }
}
