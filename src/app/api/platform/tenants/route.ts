import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { createPlatformTenant, listPlatformTenants } from '@libs/platform/admin'
import type { TenantStatus, TenantSubscription } from '@libs/firebase/types'

export async function GET(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const includeArchived = new URL(request.url).searchParams.get('archived') === '1'
  const tenants = await listPlatformTenants(includeArchived)

  return NextResponse.json({ ok: true, tenants })
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const tenant = await createPlatformTenant({
      name: body.name,
      slug: body.slug,
      status: body.status as TenantStatus | undefined,
      isTemplate: Boolean(body.isTemplate),
      ownerEmail: body.ownerEmail,
      ownerPassword: body.ownerPassword,
      ownerDisplayName: body.ownerDisplayName,
      subscription: body.subscription as Partial<TenantSubscription> | undefined
    })

    return NextResponse.json({ ok: true, tenant })
  } catch (error) {
    console.error('create tenant failed', error)

    return NextResponse.json({ error: 'Unable to create tenant' }, { status: 400 })
  }
}
