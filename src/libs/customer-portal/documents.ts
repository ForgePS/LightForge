import 'server-only'

import { FieldValue, type DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'
import { requireAssuranceLevel } from '@libs/customer-portal/verification'

export type PortalDocument = {
  publicNumber: string
  title: string
  category: string
  status: string
  signatureStatus: string | null
  version: number
  createdAt: string | null
  signedAt: string | null
  downloadUrl: string | null
  requiresStepUp: boolean
}

function mapDoc(id: string, data: DocumentData, forceStepUp: boolean): PortalDocument {
  return {
    publicNumber: String(data.publicNumber || id),
    title: String(data.title || 'Document'),
    category: String(data.category || 'Other customer document'),
    status: String(data.status || 'available'),
    signatureStatus: data.signatureStatus ? String(data.signatureStatus) : null,
    version: Number(data.version || 1),
    createdAt: asIso(data.createdAt),
    signedAt: asIso(data.signedAt),
    downloadUrl: data.downloadUrl ? String(data.downloadUrl) : data.url ? String(data.url) : null,
    requiresStepUp: forceStepUp || ['Signed contract', 'Service agreement', 'Property authorization'].includes(String(data.category || ''))
  }
}

export async function listPortalDocuments(session: PortalSessionContext) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.agreements) {
    throw Object.assign(new Error('Documents are not available'), { status: 403 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('documents').limit(100).get()
  const forceStepUp = settings.forceVerificationForDocuments

  const documents = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(row => row.customerVisible !== false && row.customerVisible !== 'false')
    .filter(row => belongsToPortalCustomer(row, ctx))
    .map(row => mapDoc(row.id, row, forceStepUp))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))

  return { documents }
}

export async function getPortalDocument(session: PortalSessionContext, publicNumber: string) {
  const settings = await getTenantPortalSettings(session.tenantId)
  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('documents')
    .where('publicNumber', '==', publicNumber)
    .limit(1)
    .get()

  const doc = snap.empty
    ? await adminDb.collection('tenants').doc(ctx.tenantId).collection('documents').doc(publicNumber).get()
    : snap.docs[0]!

  if (!doc.exists && snap.empty) {
    throw Object.assign(new Error('Document not found'), { status: 404 })
  }

  const data = snap.empty ? doc.data()! : snap.docs[0]!.data()
  const id = snap.empty ? doc.id : snap.docs[0]!.id

  if (data.customerVisible === false || data.customerVisible === 'false' || !belongsToPortalCustomer(data, ctx)) {
    throw Object.assign(new Error('Document not found'), { status: 404 })
  }

  const mapped = mapDoc(id, data, settings.forceVerificationForDocuments)

  if (mapped.requiresStepUp) {
    await requireAssuranceLevel(3)
  }

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.document_accessed',
    actor: { type: 'customer' },
    metadata: { publicNumber: mapped.publicNumber, category: mapped.category }
  })

  return mapped
}

export async function signPortalDocument(
  session: PortalSessionContext,
  publicNumber: string,
  input: { signerName: string; acceptedTerms: boolean; ip?: string | null }
) {
  await requireAssuranceLevel(3)

  if (!input.acceptedTerms) {
    throw Object.assign(new Error('Please accept the terms to continue'), { status: 400 })
  }

  const signerName = String(input.signerName || '').trim()

  if (signerName.length < 2) {
    throw Object.assign(new Error('Enter the signer name'), { status: 400 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('documents')
    .where('publicNumber', '==', publicNumber)
    .limit(1)
    .get()

  if (snap.empty) {
    throw Object.assign(new Error('Document not found'), { status: 404 })
  }

  const doc = snap.docs[0]!
  const data = doc.data()

  if (data.customerVisible === false || !belongsToPortalCustomer(data, ctx)) {
    throw Object.assign(new Error('Document not found'), { status: 404 })
  }

  if (data.signatureStatus === 'signed') {
    return mapDoc(doc.id, data, false)
  }

  const signedAt = new Date().toISOString()

  await doc.ref.set(
    {
      status: 'signed',
      signatureStatus: 'signed',
      signedAt,
      signerName,
      signatureVerification: 'otp_level_3',
      signatureIp: input.ip || null,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.document_signed',
    actor: { type: 'customer' },
    metadata: { publicNumber, signerName }
  })

  const updated = await doc.ref.get()

  return mapDoc(doc.id, updated.data()!, false)
}
