import { NextResponse } from 'next/server'

import { sendPortalVerification } from '@libs/customer-portal/verification'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await sendPortalVerification({
      purpose: body.purpose || 'step_up',
      channel: body.channel
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to send code',
        code: (error as { code?: string }).code
      },
      { status }
    )
  }
}
