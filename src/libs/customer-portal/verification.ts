import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings, sessionsCol } from '@libs/customer-portal/admin'
import { loadPortalCustomerContext } from '@libs/customer-portal/context'
import {
  getPortalSessionFromCookie,
  requirePortalSession,
  setPortalSessionCookie,
  type PortalSessionContext
} from '@libs/customer-portal/session'
import { generateSecureToken, hashToken, hashesEqual } from '@libs/customer-portal/tokens'
import type { AssuranceLevel } from '@libs/customer-portal/types'

function maskDestination(value: string, channel: 'email' | 'sms') {
  if (channel === 'email') {
    const [user, domain] = value.split('@')

    if (!user || !domain) return '***'

    return `${user.slice(0, 1)}***@${domain}`
  }

  const digits = value.replace(/\D/g, '')

  return digits.length >= 4 ? `***-***-${digits.slice(-4)}` : '***'
}

function generateNumericCode() {
  const n = Math.floor(Math.random() * 1_000_000)

  return String(n).padStart(6, '0')
}

export async function requireAssuranceLevel(minLevel: AssuranceLevel): Promise<PortalSessionContext> {
  const ctx = await requirePortalSession()
  const sessionSnap = await sessionsCol(ctx.tenantId).doc(ctx.session.id).get()
  const data = sessionSnap.data() || {}
  const level = Number(data.assuranceLevel || ctx.session.assuranceLevel || 1)
  const stepUpExpires = data.assuranceLevelExpiresAt ? new Date(String(data.assuranceLevelExpiresAt)).getTime() : 0
  const stepUpValid = !stepUpExpires || stepUpExpires > Date.now()
  const effective = minLevel >= 3 ? (stepUpValid ? level : Math.min(level, 2)) : level

  if (effective < minLevel) {
    throw Object.assign(new Error('Additional verification is required'), {
      status: 403,
      code: 'STEP_UP_REQUIRED',
      requiredLevel: minLevel
    })
  }

  return {
    ...ctx,
    session: {
      ...ctx.session,
      assuranceLevel: effective as AssuranceLevel
    }
  }
}

export async function sendPortalVerification(input: {
  purpose: 'payment' | 'signature' | 'profile_change' | 'step_up' | 'documents'
  channel?: 'email' | 'sms'
}) {
  const ctx = await requirePortalSession()
  const customerCtx = await loadPortalCustomerContext(ctx)
  const channel = input.channel || (customerCtx.customer.email ? 'email' : 'sms')
  const destination =
    channel === 'email'
      ? String(customerCtx.customer.email || '')
      : String(customerCtx.customer.phone || '')

  if (!destination) {
    throw Object.assign(new Error('No verified contact is available for a one-time code'), { status: 400 })
  }

  const recent = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('customerPortalVerifications')
    .where('sessionId', '==', ctx.session.id)
    .where('purpose', '==', input.purpose)
    .limit(8)
    .get()

  const latest = recent.docs
    .map(doc => doc.data())
    .sort((a, b) => String(b.sentAt || '').localeCompare(String(a.sentAt || '')))[0]

  if (latest?.sentAt) {
    const sentAt = new Date(String(latest.sentAt)).getTime()

    if (!Number.isNaN(sentAt) && Date.now() - sentAt < 30_000) {
      throw Object.assign(new Error('Please wait before requesting another code'), { status: 429 })
    }
  }

  const code = generateNumericCode()
  const ref = adminDb.collection('tenants').doc(ctx.tenantId).collection('customerPortalVerifications').doc()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const destinationMasked = maskDestination(destination, channel)

  await ref.set({
    portalId: ctx.portal.id,
    sessionId: ctx.session.id,
    channel,
    destinationMasked,
    codeHash: hashToken(code),
    purpose: input.purpose,
    attemptCount: 0,
    sentAt: new Date().toISOString(),
    expiresAt,
    verifiedAt: null,
    consumedAt: null,
    createdAt: FieldValue.serverTimestamp()
  })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: destination,
      channel,
      subject: 'Your portal verification code',
      body: 'Your one-time verification code was requested for your customer portal. It expires in 10 minutes.',
      status: 'sent',
      source: 'customer_portal_verification',
      customerId: customerCtx.customerId,
      customerName: customerCtx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: ctx.portal.id,
    customerId: customerCtx.customerId,
    action: 'portal.verification_sent',
    actor: { type: 'customer' },
    metadata: { purpose: input.purpose, channel, destinationMasked, verificationId: ref.id }
  })

  return {
    verificationId: ref.id,
    channel,
    destinationMasked,
    expiresAt,
    debugCode: process.env.NODE_ENV === 'development' ? code : undefined
  }
}

export async function confirmPortalVerification(input: { verificationId: string; code: string }) {
  const ctx = await requirePortalSession()
  const ref = adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('customerPortalVerifications')
    .doc(input.verificationId)
  const snap = await ref.get()

  if (!snap.exists) {
    throw Object.assign(new Error('Verification code is invalid or expired'), { status: 400 })
  }

  const data = snap.data()!

  if (data.sessionId !== ctx.session.id || data.consumedAt || data.verifiedAt) {
    throw Object.assign(new Error('Verification code is invalid or expired'), { status: 400 })
  }

  if (new Date(String(data.expiresAt)).getTime() < Date.now()) {
    throw Object.assign(new Error('Verification code is invalid or expired'), { status: 400 })
  }

  if (Number(data.attemptCount || 0) >= 5) {
    throw Object.assign(new Error('Too many attempts. Request a new code.'), { status: 429 })
  }

  const ok = hashesEqual(String(data.codeHash || ''), hashToken(String(input.code || '').trim()))

  if (!ok) {
    await ref.set({ attemptCount: FieldValue.increment(1) }, { merge: true })
    await writePortalAuditEvent({
      tenantId: ctx.tenantId,
      portalId: ctx.portal.id,
      customerId: ctx.portal.customerId,
      action: 'portal.verification_failed',
      actor: { type: 'customer' },
      metadata: { verificationId: ref.id, purpose: data.purpose }
    })
    throw Object.assign(new Error('Verification code is invalid or expired'), { status: 400 })
  }

  const settings = await getTenantPortalSettings(ctx.tenantId)
  const now = new Date()
  const assuranceLevelExpiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString()
  const maxAgeSeconds = Math.max(
    60,
    Math.floor((new Date(String(ctx.session.expiresAt || now)).getTime() - now.getTime()) / 1000)
  )

  const newRaw = generateSecureToken(32)
  const newHash = hashToken(newRaw)
  const oldHash = hashToken(ctx.rawSessionToken)

  await sessionsCol(ctx.tenantId)
    .doc(ctx.session.id)
    .set(
      {
        sessionTokenHash: newHash,
        assuranceLevel: 3,
        assuranceLevelExpiresAt,
        lastSeenAt: FieldValue.serverTimestamp(),
        idleExpiresAt: new Date(now.getTime() + settings.sessionIdleMinutes * 60 * 1000).toISOString()
      },
      { merge: true }
    )

  await adminDb.collection('portalSessionIndex').doc(oldHash).delete().catch(() => undefined)
  await adminDb.collection('portalSessionIndex').doc(newHash).set({
    tenantId: ctx.tenantId,
    sessionId: ctx.session.id,
    createdAt: FieldValue.serverTimestamp()
  })

  await setPortalSessionCookie(newRaw, maxAgeSeconds)

  await ref.set({ verifiedAt: now.toISOString(), consumedAt: now.toISOString() }, { merge: true })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('customerPortals')
    .doc(ctx.portal.id)
    .set({ lastVerifiedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: ctx.portal.id,
    customerId: ctx.portal.customerId,
    action: 'portal.verification_completed',
    actor: { type: 'customer' },
    metadata: { verificationId: ref.id, purpose: data.purpose, assuranceLevel: 3 }
  })

  return {
    assuranceLevel: 3 as AssuranceLevel,
    assuranceLevelExpiresAt
  }
}

export async function getVerificationStatus() {
  const ctx = await getPortalSessionFromCookie()

  if (!ctx) return null

  const snap = await sessionsCol(ctx.tenantId).doc(ctx.session.id).get()
  const data = snap.data() || {}
  const expiresAt = data.assuranceLevelExpiresAt ? String(data.assuranceLevelExpiresAt) : null
  const level = Number(data.assuranceLevel || 1)
  const active = level >= 3 && (!expiresAt || new Date(expiresAt).getTime() > Date.now())

  return {
    assuranceLevel: active ? 3 : Math.min(level, 2),
    assuranceLevelExpiresAt: active ? expiresAt : null,
    stepUpActive: active
  }
}
