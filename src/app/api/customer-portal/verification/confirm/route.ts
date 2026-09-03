import { NextResponse } from 'next/server'

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
    const body = await request.json()
    const result = await confirmPortalVerification({
      verificationId: String(body.verificationId || ''),
      code: String(body.code || '')
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to verify code' },
      { status }
    )
  }
}
