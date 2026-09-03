import { NextResponse } from 'next/server'

import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  acceptAndSignPortalProposal,
  declinePortalProposal,
  getPortalProposal,
  requestProposalChanges
} from '@libs/customer-portal/proposals'
import { requirePortalSession } from '@libs/customer-portal/session'

type Params = { params: Promise<{ publicNumber: string }> }

function clientMeta(request: Request) {
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip'),
    userAgent: request.headers.get('user-agent')
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.proposals) {
      return NextResponse.json({ error: 'Proposals are not available' }, { status: 403 })
    }

    const { publicNumber } = await params
    const proposal = await getPortalProposal(session, publicNumber)

    return NextResponse.json({ ok: true, proposal })
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

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.proposals) {
      return NextResponse.json({ error: 'Proposals are not available' }, { status: 403 })
    }

    const { publicNumber } = await params
    const body = await request.json()
    const action = String(body.action || '')
    const meta = clientMeta(request)

    if (action === 'change-request') {
      const proposal = await requestProposalChanges(session, publicNumber, String(body.message || ''))

      return NextResponse.json({ ok: true, proposal })
    }

    if (action === 'decline') {
      const proposal = await declinePortalProposal(session, publicNumber, body.reason ? String(body.reason) : undefined)

      return NextResponse.json({ ok: true, proposal })
    }

    if (action === 'accept-sign') {
      const proposal = await acceptAndSignPortalProposal(session, publicNumber, {
        signerName: String(body.signerName || ''),
        signerRole: body.signerRole ? String(body.signerRole) : undefined,
        acceptedTerms: Boolean(body.acceptedTerms),
        selectedOptionalIds: Array.isArray(body.selectedOptionalIds)
          ? body.selectedOptionalIds.map(String)
          : [],
        ip: meta.ip,
        userAgent: meta.userAgent
      })

      return NextResponse.json({ ok: true, proposal })
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
