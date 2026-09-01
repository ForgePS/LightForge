import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { requireActiveTenantContext } from '@libs/modules/crud'

export async function GET() {
  try {
    const ctx = await requireActiveTenantContext()
    const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('settings').doc('general').get()

    return NextResponse.json({ ok: true, settings: snap.exists ? snap.data() : {} })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await adminDb
      .collection('tenants')
      .doc(ctx.tenantId)
      .collection('settings')
      .doc('general')
      .set({ ...body, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
