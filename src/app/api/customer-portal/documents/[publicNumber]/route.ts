import { NextResponse } from 'next/server'

import { getPortalDocument, signPortalDocument } from '@libs/customer-portal/documents'
import { requirePortalSession } from '@libs/customer-portal/session'

type Params = { params: Promise<{ publicNumber: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requirePortalSession()
    const { publicNumber } = await params
    const document = await getPortalDocument(session, publicNumber)

    return NextResponse.json({ ok: true, document })
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
    const { publicNumber } = await params
    const body = await request.json()
    const document = await signPortalDocument(session, publicNumber, {
      signerName: String(body.signerName || ''),
      acceptedTerms: Boolean(body.acceptedTerms),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    })

    return NextResponse.json({ ok: true, document })
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
