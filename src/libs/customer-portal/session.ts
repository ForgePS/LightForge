import 'server-only'

import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { grantsCol, getTenantPortalSettings, portalsCol, sessionsCol } from '@libs/customer-portal/admin'
import { PORTAL_SESSION_COOKIE } from '@libs/customer-portal/settings'
import { serializePortal, serializeSession } from '@libs/customer-portal/serialize'
import { generateSecureToken, hashToken, hashesEqual } from '@libs/customer-portal/tokens'
import type { AssuranceLevel, CustomerPortalRecord, CustomerPortalSession } from '@libs/customer-portal/types'

export type PortalSessionContext = {
  session: CustomerPortalSession
  portal: CustomerPortalRecord
  tenantId: string
  rawSessionToken: string
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export async function setPortalSessionCookie(rawToken: string, maxAgeSeconds: number) {
  const cookieStore = await cookies()

  cookieStore.set(PORTAL_SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds
  })
}

export async function clearPortalSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set(PORTAL_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
}

export async function resolveShortCode(shortCode: string) {
  const normalized = shortCode.toUpperCase()
  const indexSnap = await adminDb.collection('portalShortCodes').doc(normalized).get()

  if (indexSnap.exists) {
    return indexSnap.data() as { tenantId: string; portalId: string }
  }

  const alt = await adminDb.collection('portalShortCodes').doc(shortCode).get()

  if (!alt.exists) return null

  return alt.data() as { tenantId: string; portalId: string }
}

export async function exchangeGrantToken(input: { shortCode: string; grantToken: string }) {
  const index = await resolveShortCode(input.shortCode)

  if (!index) {
    throw Object.assign(new Error('Portal link is invalid or expired'), { status: 404 })
  }

  const { tenantId, portalId } = index
  const settings = await getTenantPortalSettings(tenantId)

  if (!settings.enabled) {
    throw Object.assign(new Error('This portal is currently unavailable'), { status: 403 })
  }

  const portalSnap = await portalsCol(tenantId).doc(portalId).get()

  if (!portalSnap.exists || portalSnap.data()?.status !== 'active') {
    throw Object.assign(new Error('This portal is currently unavailable'), { status: 403 })
  }

  const portal = serializePortal(portalSnap.id, portalSnap.data()!, tenantId)
  const grantHash = hashToken(input.grantToken)
  const grantsSnap = await grantsCol(tenantId)
    .where('portalId', '==', portalId)
    .where('status', '==', 'active')
    .limit(5)
    .get()

  const grantDoc = grantsSnap.docs.find(doc => hashesEqual(String(doc.data().tokenHash || ''), grantHash))

  if (!grantDoc) {
    await writePortalAuditEvent({
      tenantId,
      portalId,
      customerId: portal.customerId,
      action: 'portal.grant_exchange_failed',
      actor: { type: 'customer' },
      metadata: { shortCode: input.shortCode }
    })
    throw Object.assign(new Error('Portal link is invalid or expired'), { status: 401 })
  }

  const now = new Date()
  const absoluteExpires = addHours(now, settings.sessionAbsoluteHours)
  const idleExpires = addMinutes(now, settings.sessionIdleMinutes)
  const rawSessionToken = generateSecureToken(32)
  const sessionTokenHash = hashToken(rawSessionToken)
  const sessionRef = sessionsCol(tenantId).doc()

  await sessionRef.set({
    portalId,
    grantId: grantDoc.id,
    sessionTokenHash,
    assuranceLevel: 1,
    verifiedContactId: null,
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
    expiresAt: absoluteExpires.toISOString(),
    idleExpiresAt: idleExpires.toISOString(),
    revokedAt: null,
    riskFlags: []
  })

  await adminDb.collection('portalSessionIndex').doc(sessionTokenHash).set({
    tenantId,
    sessionId: sessionRef.id,
    createdAt: FieldValue.serverTimestamp()
  })

  await grantDoc.ref.set({ lastUsedAt: FieldValue.serverTimestamp() }, { merge: true })
  await portalsCol(tenantId)
    .doc(portalId)
    .set({ lastAccessAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true })

  const maxAgeSeconds = Math.floor((absoluteExpires.getTime() - now.getTime()) / 1000)

  await setPortalSessionCookie(rawSessionToken, maxAgeSeconds)

  await writePortalAuditEvent({
    tenantId,
    portalId,
    customerId: portal.customerId,
    action: 'portal.session_created',
    actor: { type: 'customer' },
    metadata: { grantId: grantDoc.id, sessionId: sessionRef.id, assuranceLevel: 1 }
  })

  return {
    tenantId,
    portal,
    sessionId: sessionRef.id,
    assuranceLevel: 1 as AssuranceLevel,
    redirectTo: '/portal/home'
  }
}

async function hydrateSessionContext(
  tenantId: string,
  sessionId: string,
  data: DocumentData,
  rawSessionToken: string
): Promise<PortalSessionContext | null> {
  if (data.revokedAt) return null

  const now = Date.now()
  const expiresAt = data.expiresAt ? new Date(String(data.expiresAt)).getTime() : 0
  const idleExpiresAt = data.idleExpiresAt ? new Date(String(data.idleExpiresAt)).getTime() : 0

  if ((expiresAt && expiresAt < now) || (idleExpiresAt && idleExpiresAt < now)) {
    return null
  }

  const portalSnap = await portalsCol(tenantId).doc(String(data.portalId)).get()

  if (!portalSnap.exists || portalSnap.data()?.status !== 'active') {
    return null
  }

  const settings = await getTenantPortalSettings(tenantId)

  if (!settings.enabled) return null

  const idleExpires = addMinutes(new Date(), settings.sessionIdleMinutes).toISOString()

  await sessionsCol(tenantId)
    .doc(sessionId)
    .set({ lastSeenAt: FieldValue.serverTimestamp(), idleExpiresAt: idleExpires }, { merge: true })

  return {
    tenantId,
    rawSessionToken,
    session: serializeSession(sessionId, { ...data, idleExpiresAt: idleExpires }, tenantId),
    portal: serializePortal(portalSnap.id, portalSnap.data()!, tenantId)
  }
}

export async function getPortalSessionFromCookie(): Promise<PortalSessionContext | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PORTAL_SESSION_COOKIE)?.value

  if (!raw) return null

  const tokenHash = hashToken(raw)
  const indexSnap = await adminDb.collection('portalSessionIndex').doc(tokenHash).get()

  if (!indexSnap.exists) return null

  const { tenantId, sessionId } = indexSnap.data() as { tenantId: string; sessionId: string }
  const sessionSnap = await sessionsCol(tenantId).doc(sessionId).get()

  if (!sessionSnap.exists) return null

  return hydrateSessionContext(tenantId, sessionSnap.id, sessionSnap.data()!, raw)
}

export async function requirePortalSession(): Promise<PortalSessionContext> {
  const ctx = await getPortalSessionFromCookie()

  if (!ctx) {
    throw Object.assign(new Error('Portal session expired'), { status: 401 })
  }

  return ctx
}

export async function revokeCurrentPortalSession() {
  const ctx = await getPortalSessionFromCookie()

  if (!ctx) {
    await clearPortalSessionCookie()

    return
  }

  await sessionsCol(ctx.tenantId)
    .doc(ctx.session.id)
    .set(
      {
        revokedAt: FieldValue.serverTimestamp(),
        revokeReason: 'customer_sign_out'
      },
      { merge: true }
    )

  await adminDb.collection('portalSessionIndex').doc(hashToken(ctx.rawSessionToken)).delete().catch(() => undefined)
  await clearPortalSessionCookie()

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: ctx.portal.id,
    customerId: ctx.portal.customerId,
    action: 'portal.session_revoked',
    actor: { type: 'customer' },
    metadata: { reason: 'customer_sign_out' }
  })
}
