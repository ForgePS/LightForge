import { NextResponse } from 'next/server'

import { getSessionUser } from '@libs/auth/session'
import { setActiveTenant } from '@libs/tenants/provision'

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const tenantId = body?.tenantId as string | undefined

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    await setActiveTenant(user.uid, tenantId)

    return NextResponse.json({ ok: true, activeTenantId: tenantId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to switch tenant'

    console.error('switch tenant failed', error)

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
