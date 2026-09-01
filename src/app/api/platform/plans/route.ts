import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { listSubscriptionPlans, upsertSubscriptionPlans } from '@libs/platform/admin'
import type { SubscriptionPlan } from '@libs/firebase/types'

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const plans = await listSubscriptionPlans()

  return NextResponse.json({ ok: true, plans })
}

export async function PUT(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const plans = body.plans as SubscriptionPlan[]

    await upsertSubscriptionPlans(plans)

    return NextResponse.json({ ok: true, plans })
  } catch (error) {
    console.error('update plans failed', error)

    return NextResponse.json({ error: 'Unable to update plans' }, { status: 400 })
  }
}
