import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { updateTenantSubscription } from '@libs/platform/admin'
import type { TenantSubscription } from '@libs/firebase/types'

type Params = { params: Promise<{ tenantId: string }> }

export async function PUT(request: Request, { params }: Params) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const { tenantId } = await params
    const body = (await request.json()) as TenantSubscription
    const tenant = await updateTenantSubscription(tenantId, body)

    return NextResponse.json({ ok: true, tenant })
  } catch (error) {
    console.error('update subscription failed', error)

    return NextResponse.json({ error: 'Unable to update subscription' }, { status: 400 })
  }
}
