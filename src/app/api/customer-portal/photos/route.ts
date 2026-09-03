import { NextResponse } from 'next/server'

import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalPhotos, uploadPortalServicePhoto } from '@libs/customer-portal/photos'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.photos) {
      return NextResponse.json({ error: 'Photos are not available' }, { status: 403 })
    }

    const data = await getPortalPhotos(session)

    return NextResponse.json({ ok: true, ...data })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()
    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose a photo to upload' }, { status: 400 })
    }

    const photo = await uploadPortalServicePhoto(session, file)

    return NextResponse.json({ ok: true, photo })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
