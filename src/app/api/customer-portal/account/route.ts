import { NextResponse } from 'next/server'

import {
  getPortalEnhancements,
  submitPortalReferral,
  submitPortalReview,
  updateAutopayPreference
} from '@libs/customer-portal/enhancements'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const data = await getPortalEnhancements(session)

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
    const action = String(body.action || '')

    if (action === 'review') {
      const result = await submitPortalReview(session, {
        rating: Number(body.rating || 0),
        notes: body.notes ? String(body.notes) : undefined
      })

      return NextResponse.json({ ok: true, ...result })
    }

    if (action === 'referral') {
      const result = await submitPortalReferral(session, {
        friendName: String(body.friendName || ''),
        friendEmail: body.friendEmail ? String(body.friendEmail) : undefined,
        friendPhone: body.friendPhone ? String(body.friendPhone) : undefined
      })

      return NextResponse.json({ ok: true, ...result })
    }

    if (action === 'autopay') {
      const data = await updateAutopayPreference(session, {
        enabled: Boolean(body.enabled),
        consent: Boolean(body.consent)
      })

      return NextResponse.json({ ok: true, ...data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
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
