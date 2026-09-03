import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { getPortalById } from '@libs/customer-portal/admin'
import { buildShortUrl, buildSecurePortalUrl } from '@libs/customer-portal/serialize'
import { generatePortalQrPngBuffer, generatePortalQrSvg } from '@libs/customer-portal/qr'

type Params = { params: Promise<{ portalId: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const ctx = await requireActiveTenantContext()
    const { portalId } = await params
    const portal = await getPortalById(ctx.tenantId, portalId)

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'png'
    const grantToken = url.searchParams.get('token')
    const target = grantToken
      ? buildSecurePortalUrl(portal.shortCode, grantToken)
      : buildShortUrl(portal.shortCode)

    if (format === 'svg') {
      const svg = await generatePortalQrSvg(target)

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="portal-${portal.shortCode}.svg"`
        }
      })
    }

    const png = await generatePortalQrPngBuffer(target)

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="portal-${portal.shortCode}.png"`
      }
    })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
