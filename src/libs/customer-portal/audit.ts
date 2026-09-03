import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'

export type PortalAuditActor = {
  type: 'staff' | 'customer' | 'system'
  id?: string | null
  email?: string | null
  displayName?: string | null
}

export async function writePortalAuditEvent(input: {
  tenantId: string
  portalId?: string | null
  customerId?: string | null
  action: string
  actor: PortalAuditActor
  metadata?: Record<string, unknown>
}) {
  const safeMetadata = { ...(input.metadata || {}) }

  for (const key of Object.keys(safeMetadata)) {
    const lower = key.toLowerCase()

    if (lower.includes('token') || lower.includes('code') || lower.includes('secret')) {
      delete safeMetadata[key]
    }
  }

  await adminDb
    .collection('tenants')
    .doc(input.tenantId)
    .collection('portalAuditEvents')
    .add({
      portalId: input.portalId || null,
      customerId: input.customerId || null,
      action: input.action,
      actor: input.actor,
      metadata: safeMetadata,
      createdAt: FieldValue.serverTimestamp()
    })
}
