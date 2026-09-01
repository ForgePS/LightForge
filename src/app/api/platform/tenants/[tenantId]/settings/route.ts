import { NextResponse } from 'next/server'

import { getTenantGeneralSettings, updateTenantGeneralSettings } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'

type Props = { params: Promise<{ tenantId: string }> }

export async function GET(_request: Request, { params }: Props) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { tenantId } = await params
  const settings = await getTenantGeneralSettings(tenantId)

  return NextResponse.json({ ok: true, settings })
}

export async function PUT(request: Request, { params }: Props) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { tenantId } = await params
  const body = await request.json()
  const settings = await updateTenantGeneralSettings(tenantId, body)

  return NextResponse.json({ ok: true, settings })
}
