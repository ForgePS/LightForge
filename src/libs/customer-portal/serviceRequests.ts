import 'server-only'

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

export const PROBLEM_TYPES = [
  'All lights not working',
  'Section of lights out',
  'Lights falling or hanging down',
  'Timer problem',
  'Extension cord or power issue',
  'Decorations damaged',
  'Color or pattern issue',
  'Removal issue',
  'Other'
] as const

export const PROBLEM_LOCATIONS = [
  'Roofline',
  'Trees',
  'Bushes',
  'Wreath',
  'Garland',
  'Ground display',
  'Walkway',
  'Entryway',
  'Backyard',
  'Other'
] as const

export type PortalServiceStatus =
  | 'Submitted'
  | 'Received'
  | 'Scheduled'
  | 'Technician En Route'
  | 'In Progress'
  | 'Completed'
  | 'Action Needed'
  | 'Canceled'

export type PortalServiceRequest = {
  publicNumber: string
  title: string
  problemType: string | null
  problemLocation: string | null
  description: string | null
  status: PortalServiceStatus
  submittedAt: string | null
  updatedAt: string | null
  resolutionSummary: string | null
  completedAt: string | null
  photoUrls: string[]
}

function mapCustomerStatus(internal: string): PortalServiceStatus {
  switch (internal) {
    case 'open':
    case 'new':
      return 'Submitted'
    case 'accepted':
    case 'received':
      return 'Received'
    case 'scheduled':
    case 'assigned':
      return 'Scheduled'
    case 'en_route':
      return 'Technician En Route'
    case 'in_progress':
      return 'In Progress'
    case 'resolved':
    case 'complete':
    case 'completed':
      return 'Completed'
    case 'waiting_on_customer':
      return 'Action Needed'
    case 'canceled':
    case 'cancelled':
      return 'Canceled'
    default:
      return 'Received'
  }
}

function serializeRequest(data: DocumentData): PortalServiceRequest {
  return {
    publicNumber: String(data.publicNumber || data.id || ''),
    title: String(data.title || 'Lighting issue'),
    problemType: data.problemType ? String(data.problemType) : null,
    problemLocation: data.problemLocation ? String(data.problemLocation) : null,
    description: data.customerDescription
      ? String(data.customerDescription)
      : data.description
        ? String(data.description)
        : null,
    status: mapCustomerStatus(String(data.status || 'open')),
    submittedAt: asIso(data.createdAt),
    updatedAt: asIso(data.updatedAt),
    resolutionSummary: data.customerVisibleResolution ? String(data.customerVisibleResolution) : null,
    completedAt: data.status === 'resolved' ? asIso(data.updatedAt) : null,
    photoUrls: Array.isArray(data.customerPhotoUrls) ? data.customerPhotoUrls.map(String) : []
  }
}

async function nextPublicNumber(tenantId: string) {
  const year = new Date().getFullYear()
  const counterRef = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('serviceRequestCounter')

  const publicNumber = await adminDb.runTransaction(async tx => {
    const snap = await tx.get(counterRef)
    const current = snap.exists ? Number(snap.data()?.year === year ? snap.data()?.value || 0 : 0) : 0
    const next = current + 1

    tx.set(
      counterRef,
      {
        year,
        value: next,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

    return `SR-${year}-${String(next).padStart(5, '0')}`
  })

  return publicNumber
}

export async function listPortalServiceRequests(session: PortalSessionContext) {
  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('serviceIssues').limit(100).get()

  const requests = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(row => belongsToPortalCustomer(row, ctx))
    .map(row => serializeRequest(row))
    .sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')))

  return { requests }
}

export async function getPortalServiceRequest(session: PortalSessionContext, publicNumber: string) {
  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('serviceIssues')
    .where('publicNumber', '==', publicNumber)
    .limit(1)
    .get()

  if (snap.empty) {
    throw Object.assign(new Error('Service request not found'), { status: 404 })
  }

  const doc = snap.docs[0]!
  const data = doc.data()

  if (!belongsToPortalCustomer(data, ctx)) {
    throw Object.assign(new Error('Service request not found'), { status: 404 })
  }

  return serializeRequest({ ...data, id: doc.id })
}

export type CreateServiceRequestInput = {
  problemType: string
  problemLocation: string
  description: string
  startedAt?: string
  preferredContactMethod?: string
  accessIfAway?: boolean
  availability?: string
  safetyAcknowledged: boolean
  photoUrls?: string[]
  idempotencyKey?: string
}

async function writeStaffNotification(ctx: PortalCustomerContext, publicNumber: string, title: string) {
  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Portal service request ${publicNumber}`,
      body: `Customer ${ctx.customerName} submitted: ${title}`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
}

async function writeCustomerConfirmation(ctx: PortalCustomerContext, publicNumber: string) {
  const email = typeof ctx.customer.email === 'string' ? ctx.customer.email : null

  if (!email) return

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: email,
      channel: 'email',
      subject: `We received your lighting request (${publicNumber})`,
      body: `Thanks — your request ${publicNumber} was received. Track it in your customer portal.`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
}

export async function createPortalServiceRequest(session: PortalSessionContext, input: CreateServiceRequestInput) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.serviceRequests) {
    throw Object.assign(new Error('Service requests are disabled'), { status: 403 })
  }

  if (!input.safetyAcknowledged) {
    throw Object.assign(new Error('Please acknowledge the safety message before submitting'), { status: 400 })
  }

  const problemType = String(input.problemType || '').trim()
  const problemLocation = String(input.problemLocation || '').trim()
  const description = String(input.description || '').trim()

  if (!problemType || !PROBLEM_TYPES.includes(problemType as (typeof PROBLEM_TYPES)[number])) {
    throw Object.assign(new Error('Select a valid problem type'), { status: 400 })
  }

  if (!problemLocation || !PROBLEM_LOCATIONS.includes(problemLocation as (typeof PROBLEM_LOCATIONS)[number])) {
    throw Object.assign(new Error('Select a valid location'), { status: 400 })
  }

  if (description.length < 5) {
    throw Object.assign(new Error('Please describe the issue'), { status: 400 })
  }

  const ctx = await loadPortalCustomerContext(session)

  if (input.idempotencyKey) {
    const existing = await adminDb
      .collection('tenants')
      .doc(ctx.tenantId)
      .collection('serviceIssues')
      .where('idempotencyKey', '==', input.idempotencyKey)
      .limit(1)
      .get()

    if (!existing.empty) {
      return serializeRequest(existing.docs[0]!.data())
    }
  }

  const publicNumber = await nextPublicNumber(ctx.tenantId)
  const title = `${problemType} — ${problemLocation}`
  const ref = adminDb.collection('tenants').doc(ctx.tenantId).collection('serviceIssues').doc()

  await ref.set({
    title,
    propertyName: ctx.propertyName,
    propertyId: ctx.propertyId,
    jobTitle: '',
    priority: 'medium',
    status: 'open',
    notes: `Portal submission. Staff notes only.`,
    publicNumber,
    problemType,
    problemLocation,
    customerDescription: description,
    customerVisibleResolution: null,
    startedAt: input.startedAt || null,
    preferredContactMethod: input.preferredContactMethod || null,
    accessIfAway: Boolean(input.accessIfAway),
    availability: input.availability || null,
    safetyAcknowledged: true,
    customerPhotoUrls: Array.isArray(input.photoUrls) ? input.photoUrls.map(String).slice(0, 5) : [],
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    source: 'customer_portal',
    portalId: ctx.portal.id,
    idempotencyKey: input.idempotencyKey || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await writeStaffNotification(ctx, publicNumber, title)
  await writeCustomerConfirmation(ctx, publicNumber)

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: ctx.portal.id,
    customerId: ctx.customerId,
    action: 'portal.service_request_created',
    actor: { type: 'customer' },
    metadata: { publicNumber, problemType, problemLocation }
  })

  const snap = await ref.get()

  return serializeRequest(snap.data()!)
}
