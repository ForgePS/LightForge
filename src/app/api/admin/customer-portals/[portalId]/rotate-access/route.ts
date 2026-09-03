import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { rotatePortalAccess } from '@libs/customer-portal/admin'
import { generatePortalQrDataUrl } from '@libs/customer-portal/qr'

type Params = { params: Promise<{ portalId: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireActiveTenantContext()
    const { portalId } = await params
    const body = await request.json().catch(() => ({}))
    const result = await rotatePortalAccess({
      tenantId: ctx.tenantId,
      portalId,
      actorUid: ctx.user.uid,
      actorEmail: ctx.user.email,
      reason: typeof body.reason === 'string' ? body.reason : 'access_rotated',
      rotateShortCode: Boolean(body.rotateShortCode)
    })

    const qrDataUrl = await generatePortalQrDataUrl(result.secureUrl)

    return NextResponse.json({
      ok: true,
      portal: result.portal,
      shortUrl: result.shortUrl,
      secureUrl: result.secureUrl,
      grantToken: result.grantToken,
      grantPrefix: result.grantPrefix,
      qrDataUrl,
      notice: 'Copy the new secure link now. Previous links and sessions no longer work.'
    })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
