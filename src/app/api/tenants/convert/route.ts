import { NextResponse } from 'next/server'

import { getSessionUser } from '@libs/auth/session'
import { convertTenantToActive } from '@libs/tenants/provision'

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()

    if (!user?.activeTenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const name = body?.name as string | undefined
    const planId = body?.planId as 'starter' | 'professional' | 'enterprise' | undefined

    const result = await convertTenantToActive({
      tenantId: user.activeTenantId,
      uid: user.uid,
      name,
      planId
    })

    return NextResponse.json({ ok: true, tenant: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to convert tenant'

    console.error('convert failed', error)

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
