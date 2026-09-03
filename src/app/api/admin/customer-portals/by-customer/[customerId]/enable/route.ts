import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { enableCustomerPortal } from '@libs/customer-portal/admin'
import { generatePortalQrDataUrl } from '@libs/customer-portal/qr'

type Params = { params: Promise<{ customerId: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const ctx = await requireActiveTenantContext()

    if (ctx.accessBlocked && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Workspace access is blocked' }, { status: 403 })
    }

    const { customerId } = await params
    const result = await enableCustomerPortal({
      tenantId: ctx.tenantId,
      customerId,
      actorUid: ctx.user.uid,
      actorEmail: ctx.user.email
    })

    const qrDataUrl = result.secureUrl ? await generatePortalQrDataUrl(result.secureUrl) : null

    return NextResponse.json({
      ok: true,
      portal: result.portal,
      shortUrl: result.shortUrl,
      secureUrl: result.secureUrl,
      grantToken: result.grantToken,
      grantPrefix: result.grantPrefix,
      alreadyEnabled: result.alreadyEnabled,
      qrDataUrl,
      notice: result.grantToken
        ? 'Copy the secure link now. The full access token is shown only once.'
        : 'Portal was already active. Rotate access to issue a new secure link and QR code.'
    })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
