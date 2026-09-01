import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { getPlatformTenant, updatePlatformTenant } from '@libs/platform/admin'
import type { TenantStatus } from '@libs/firebase/types'

type Params = { params: Promise<{ tenantId: string }> }

export async function GET(_request: Request, { params }: Params) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { tenantId } = await params
  const tenant = await getPlatformTenant(tenantId)

  if (!tenant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, tenant })
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const { tenantId } = await params
    const body = await request.json()
    const tenant = await updatePlatformTenant(tenantId, {
      name: body.name,
      slug: body.slug,
      status: body.status as TenantStatus | undefined,
      isTemplate: body.isTemplate,
      archived: typeof body.archived === 'boolean' ? body.archived : undefined
    })

    return NextResponse.json({ ok: true, tenant })
  } catch (error) {
    console.error('update tenant failed', error)

    return NextResponse.json({ error: 'Unable to update tenant' }, { status: 400 })
  }
}
