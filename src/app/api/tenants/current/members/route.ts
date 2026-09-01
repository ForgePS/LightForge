import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { inviteTenantMember, removeTenantMember, updateTenantMemberRole } from '@libs/tenants/provision'
import type { MemberRole } from '@libs/firebase/types'
import { adminDb } from '@libs/firebase/admin'

export async function GET() {
  try {
    const ctx = await requireActiveTenantContext()
    const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('members').get()
    const members = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }))

    return NextResponse.json({ ok: true, members })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const member = await inviteTenantMember({
      tenantId: ctx.tenantId,
      email: body.email,
      displayName: body.displayName,
      role: (body.role || 'member') as MemberRole,
      password: body.password
    })

    return NextResponse.json({ ok: true, member })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await updateTenantMemberRole(ctx.tenantId, body.uid, body.role as MemberRole)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await removeTenantMember(ctx.tenantId, body.uid)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
