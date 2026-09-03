import 'server-only'

import { createHash } from 'crypto'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext,
  type PortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'
import { requireAssuranceLevel } from '@libs/customer-portal/verification'

export type PortalProposalLineItem = {
  id: string
  name: string
  serviceArea: string
  description: string | null
  amountCents: number
  optional: boolean
  selected: boolean
}

export type PortalProposalSummary = {
  publicNumber: string
  title: string
  status: string
  customerStatus: string
  amountCents: number
  depositCents: number | null
  propertyName: string | null
  updatedAt: string | null
  expiresAt: string | null
}

export type PortalProposalDetail = PortalProposalSummary & {
  version: number
  taxCents: number
  totalCents: number
  summary: string | null
  terms: string | null
  lineItems: PortalProposalLineItem[]
  attachments: Array<{ title: string; url: string }>
  canAccept: boolean
  canDecline: boolean
  canRequestChanges: boolean
  canSign: boolean
  signature: {
    signedAt: string | null
    signerName: string | null
  } | null
}

const CUSTOMER_VISIBLE_STATUSES = new Set([
  'sent',
  'ready_for_review',
  'viewed',
  'change_requested',
  'accepted_pending_signature',
  'accepted_pending_deposit',
  'accepted',
  'approved',
  'declined',
  'expired'
])

function mapCustomerStatus(status: string) {
  switch (status) {
    case 'sent':
    case 'ready_for_review':
      return 'Ready for review'
    case 'viewed':
      return 'Viewed'
    case 'change_requested':
      return 'Change requested'
    case 'accepted_pending_signature':
      return 'Accepted — signature needed'
    case 'accepted_pending_deposit':
      return 'Accepted — deposit due'
    case 'accepted':
    case 'approved':
      return 'Approved'
    case 'declined':
      return 'Declined'
    case 'expired':
      return 'Expired'
    case 'superseded':
      return 'Superseded'
    default:
      return 'Unavailable'
  }
}

function summarize(data: DocumentData & { id?: string }): PortalProposalSummary {
  const status = String(data.status || '')
  const amountCents = Number(data.amountCents || 0)

  return {
    publicNumber: String(data.publicNumber || data.id || ''),
    title: String(data.title || 'Lighting proposal'),
    status,
    customerStatus: mapCustomerStatus(status),
    amountCents,
    depositCents: data.depositCents != null ? Number(data.depositCents) : Math.round(amountCents * 0.3),
    propertyName: data.propertyName ? String(data.propertyName) : null,
    updatedAt: asIso(data.updatedAt),
    expiresAt: data.expiresAt ? String(data.expiresAt) : null
  }
}

function lineItemsFrom(data: DocumentData): PortalProposalLineItem[] {
  if (Array.isArray(data.lineItems)) {
    return data.lineItems.map((item: DocumentData, index: number) => ({
      id: String(item.id || `line-${index}`),
      name: String(item.name || 'Line item'),
      serviceArea: String(item.serviceArea || 'General'),
      description: item.description ? String(item.description) : null,
      amountCents: Number(item.amountCents || 0),
      optional: Boolean(item.optional),
      selected: item.selected !== false
    }))
  }

  // Fallback single package line for legacy proposals
  return [
    {
      id: 'package',
      name: String(data.title || 'Lighting package'),
      serviceArea: 'Package',
      description: data.customerSummary ? String(data.customerSummary) : null,
      amountCents: Number(data.amountCents || 0),
      optional: false,
      selected: true
    }
  ]
}

async function findProposal(ctx: PortalCustomerContext, publicNumber: string) {
  const snap = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('proposals')
    .where('publicNumber', '==', publicNumber)
    .limit(1)
    .get()

  if (!snap.empty) {
    const doc = snap.docs[0]!

    return { id: doc.id, data: doc.data() }
  }

  // Fallback: allow legacy docs referenced by firestore id only when owned
  const byId = await adminDb.collection('tenants').doc(ctx.tenantId).collection('proposals').doc(publicNumber).get()

  if (byId.exists) {
    return { id: byId.id, data: byId.data()! }
  }

  return null
}

function assertVisible(data: DocumentData, ctx: PortalCustomerContext) {
  if (!belongsToPortalCustomer(data, ctx)) {
    throw Object.assign(new Error('Proposal not found'), { status: 404 })
  }

  if (!CUSTOMER_VISIBLE_STATUSES.has(String(data.status || '')) || data.status === 'draft') {
    throw Object.assign(new Error('Proposal not found'), { status: 404 })
  }
}

export async function listPortalProposals(session: PortalSessionContext) {
  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('proposals').limit(100).get()

  const proposals = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(row => belongsToPortalCustomer(row, ctx))
    .filter(row => CUSTOMER_VISIBLE_STATUSES.has(String(row.status || '')) && row.status !== 'draft')
    .map(row => summarize(row))
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))

  return { proposals }
}

export async function getPortalProposal(session: PortalSessionContext, publicNumber: string) {
  const ctx = await loadPortalCustomerContext(session)
  const found = await findProposal(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Proposal not found'), { status: 404 })

  assertVisible(found.data, ctx)

  const status = String(found.data.status || '')
  const amountCents = Number(found.data.amountCents || 0)
  const taxCents = Number(found.data.taxCents || 0)
  const lineItems = lineItemsFrom(found.data)
  const summary = summarize({ ...found.data, id: found.id })

  if (status === 'sent' || status === 'ready_for_review') {
    await adminDb
      .collection('tenants')
      .doc(ctx.tenantId)
      .collection('proposals')
      .doc(found.id)
      .set({ status: 'viewed', viewedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true })

    await writePortalAuditEvent({
      tenantId: ctx.tenantId,
      portalId: session.portal.id,
      customerId: ctx.customerId,
      action: 'portal.proposal_viewed',
      actor: { type: 'customer' },
      metadata: { publicNumber: summary.publicNumber }
    })
  }

  const detail: PortalProposalDetail = {
    ...summary,
    status: status === 'sent' || status === 'ready_for_review' ? 'viewed' : status,
    customerStatus: mapCustomerStatus(status === 'sent' || status === 'ready_for_review' ? 'viewed' : status),
    version: Number(found.data.version || 1),
    taxCents,
    totalCents: amountCents + taxCents,
    summary: found.data.customerSummary
      ? String(found.data.customerSummary)
      : found.data.summary
        ? String(found.data.summary)
        : null,
    terms: found.data.customerTerms ? String(found.data.customerTerms) : defaultTerms(),
    lineItems,
    attachments: Array.isArray(found.data.customerAttachments)
      ? found.data.customerAttachments.map((item: DocumentData) => ({
          title: String(item.title || 'Attachment'),
          url: String(item.url || '')
        }))
      : [],
    canAccept: ['sent', 'ready_for_review', 'viewed', 'change_requested'].includes(status),
    canDecline: ['sent', 'ready_for_review', 'viewed', 'change_requested'].includes(status),
    canRequestChanges: ['sent', 'ready_for_review', 'viewed'].includes(status),
    canSign: ['accepted_pending_signature', 'viewed', 'sent', 'ready_for_review', 'change_requested'].includes(status),
    signature: found.data.signedAt
      ? {
          signedAt: asIso(found.data.signedAt),
          signerName: found.data.signerName ? String(found.data.signerName) : null
        }
      : null
  }

  return detail
}

function defaultTerms() {
  return 'By accepting, you agree to the service scope, pricing, and seasonal installation terms provided by your lighting company. Electronic acceptance and signature are recorded for your account. This flow has not been reviewed as legally sufficient for every jurisdiction.'
}

export async function requestProposalChanges(
  session: PortalSessionContext,
  publicNumber: string,
  message: string
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.proposals) throw Object.assign(new Error('Proposals are disabled'), { status: 403 })

  const text = String(message || '').trim()

  if (text.length < 5) throw Object.assign(new Error('Please describe the changes you need'), { status: 400 })

  const ctx = await loadPortalCustomerContext(session)
  const found = await findProposal(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Proposal not found'), { status: 404 })
  assertVisible(found.data, ctx)

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('proposals')
    .doc(found.id)
    .set(
      {
        status: 'change_requested',
        changeRequestMessage: text,
        changeRequestedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Proposal change request ${found.data.publicNumber || found.id}`,
      body: text,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.proposal_change_requested',
    actor: { type: 'customer' },
    metadata: { publicNumber: found.data.publicNumber || found.id }
  })

  return getPortalProposal(session, String(found.data.publicNumber || found.id))
}

export async function declinePortalProposal(
  session: PortalSessionContext,
  publicNumber: string,
  reason?: string
) {
  const ctx = await loadPortalCustomerContext(session)
  const found = await findProposal(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Proposal not found'), { status: 404 })
  assertVisible(found.data, ctx)

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('proposals')
    .doc(found.id)
    .set(
      {
        status: 'declined',
        declinedAt: FieldValue.serverTimestamp(),
        declineReason: reason ? String(reason) : null,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.proposal_declined',
    actor: { type: 'customer' },
    metadata: { publicNumber: found.data.publicNumber || found.id }
  })

  return getPortalProposal(session, String(found.data.publicNumber || found.id))
}

export async function acceptAndSignPortalProposal(
  session: PortalSessionContext,
  publicNumber: string,
  input: {
    signerName: string
    signerRole?: string
    acceptedTerms: boolean
    selectedOptionalIds?: string[]
    ip?: string | null
    userAgent?: string | null
  }
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
  const found = await findProposal(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Proposal not found'), { status: 404 })
  assertVisible(found.data, ctx)

  const status = String(found.data.status || '')

  if (!['sent', 'ready_for_review', 'viewed', 'change_requested', 'accepted_pending_signature'].includes(status)) {
    throw Object.assign(new Error('This proposal cannot be signed in its current state'), { status: 400 })
  }

  const lineItems = lineItemsFrom(found.data).map(item => {
    if (!item.optional) return { ...item, selected: true }

    const selected = (input.selectedOptionalIds || []).includes(item.id)

    return { ...item, selected }
  })

  const amountCents = lineItems.filter(item => item.selected).reduce((sum, item) => sum + item.amountCents, 0)
  const taxCents = Number(found.data.taxCents || 0)
  const version = Number(found.data.version || 1)
  const depositCents =
    found.data.depositCents != null ? Number(found.data.depositCents) : Math.round(amountCents * 0.3)
  const nextStatus = depositCents > 0 ? 'accepted_pending_deposit' : 'approved'
  const signedAt = new Date().toISOString()
  const payload = {
    publicNumber: String(found.data.publicNumber || found.id),
    title: String(found.data.title || ''),
    version,
    amountCents,
    taxCents,
    totalCents: amountCents + taxCents,
    lineItems,
    terms: found.data.customerTerms ? String(found.data.customerTerms) : defaultTerms(),
    signerName,
    signerRole: input.signerRole || null,
    signedAt,
    customerId: ctx.customerId,
    customerName: ctx.customerName
  }
  const contentHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex')

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('proposals')
    .doc(found.id)
    .set(
      {
        status: nextStatus,
        amountCents,
        lineItems,
        acceptedAt: FieldValue.serverTimestamp(),
        signedAt,
        signerName,
        signerRole: input.signerRole || null,
        signatureVerification: 'otp_level_3',
        signatureIp: input.ip || null,
        signatureUserAgent: input.userAgent || null,
        signatureContentHash: contentHash,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  const docRef = adminDb.collection('tenants').doc(ctx.tenantId).collection('documents').doc()

  await docRef.set({
    title: `${payload.title} — Signed copy`,
    category: 'Signed contract',
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    propertyName: found.data.propertyName || ctx.propertyName,
    publicNumber: `DOC-${payload.publicNumber}`,
    version,
    status: 'signed',
    signatureStatus: 'signed',
    customerVisible: true,
    proposalId: found.id,
    proposalPublicNumber: payload.publicNumber,
    contentHash,
    signedAt,
    signerName,
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Proposal accepted ${payload.publicNumber}`,
      body: `${signerName} accepted and signed ${payload.title}.`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.proposal_accepted_signed',
    actor: { type: 'customer' },
    metadata: {
      publicNumber: payload.publicNumber,
      contentHash,
      nextStatus,
      documentId: docRef.id
    }
  })

  return getPortalProposal(session, payload.publicNumber)
}
