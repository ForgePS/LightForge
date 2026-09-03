import { NextResponse } from 'next/server'

import { getPortalRenewal, submitAddOnRequest, submitPortalRenewal } from '@libs/customer-portal/renewal'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const renewal = await getPortalRenewal(session)

    return NextResponse.json({ ok: true, renewal })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()
    const body = await request.json()

    if (body.action === 'addon') {
      const result = await submitAddOnRequest(session, {
        serviceArea: String(body.serviceArea || 'Other'),
        description: String(body.description || '')
      })

      return NextResponse.json({ ok: true, ...result })
    }

    const renewal = await submitPortalRenewal(session, {
      keepSameDesign: body.keepSameDesign !== false,
      changeRequest: body.changeRequest ? String(body.changeRequest) : undefined,
      preferredPeriod: body.preferredPeriod ? String(body.preferredPeriod) : undefined,
      acceptTerms: Boolean(body.acceptTerms),
      signerName: body.signerName ? String(body.signerName) : undefined
    })

    return NextResponse.json({ ok: true, renewal })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed',
        code: (error as { code?: string }).code,
        requiredLevel: (error as { requiredLevel?: number }).requiredLevel
      },
      { status }
    )
  }
}
