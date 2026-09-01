import { NextResponse } from 'next/server'

import { requirePlatformAdminApi } from '@libs/platform/api'
import { inviteTenantMember, removeTenantMember, updateTenantMemberRole } from '@libs/tenants/provision'
import type { MemberRole } from '@libs/firebase/types'

type Params = { params: Promise<{ tenantId: string }> }

export async function POST(request: Request, { params }: Params) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const { tenantId } = await params
    const body = await request.json()
    const member = await inviteTenantMember({
      tenantId,
      email: body.email,
      displayName: body.displayName,
      role: (body.role || 'member') as MemberRole,
      password: body.password
    })

    return NextResponse.json({ ok: true, member })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const { tenantId } = await params
    const body = await request.json()

    await updateTenantMemberRole(tenantId, body.uid, body.role as MemberRole)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const { tenantId } = await params
    const body = await request.json()

    await removeTenantMember(tenantId, body.uid)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 })
  }
}
