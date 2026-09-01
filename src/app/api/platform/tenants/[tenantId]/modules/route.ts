import { NextResponse } from 'next/server'

import {
  activateAllTenantModules,
  deactivateAllTenantModules,
  getTenantEnabledModules,
  setTenantEnabledModules
} from '@libs/modules/tenantModules'
import { requirePlatformAdminApi } from '@libs/platform/api'

type Props = { params: Promise<{ tenantId: string }> }

export async function GET(_request: Request, { params }: Props) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { tenantId } = await params
  const enabled = await getTenantEnabledModules(tenantId)

  return NextResponse.json({ ok: true, enabled, total: enabled.length })
}

export async function PUT(request: Request, { params }: Props) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { tenantId } = await params
  const body = await request.json()

  if (body.activateAll === true) {
    const enabled = await activateAllTenantModules(tenantId)

    return NextResponse.json({ ok: true, enabled })
  }

  if (body.deactivateAll === true) {
    const enabled = await deactivateAllTenantModules(tenantId)

    return NextResponse.json({ ok: true, enabled })
  }

  if (!Array.isArray(body.enabled)) {
    return NextResponse.json({ error: 'enabled array is required' }, { status: 400 })
  }

  const enabled = await setTenantEnabledModules(tenantId, body.enabled)

  return NextResponse.json({ ok: true, enabled })
}
