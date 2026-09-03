import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import {
  CUSTOMER_PORTAL_SETTINGS_DOC,
  DEFAULT_PORTAL_FEATURE_SETTINGS,
  normalizePortalSettings
} from '@libs/customer-portal/settings'
import {
  buildSecurePortalUrl,
  buildShortUrl,
  serializeGrant,
  serializePortal
} from '@libs/customer-portal/serialize'
import { generateSecureToken, generateShortCode, hashToken, tokenPrefix } from '@libs/customer-portal/tokens'
import type { CustomerPortalFeatureSettings, PortalAdminSummary } from '@libs/customer-portal/types'

function portalsCol(tenantId: string) {
  return adminDb.collection('tenants').doc(tenantId).collection('customerPortals')
}

function grantsCol(tenantId: string) {
  return adminDb.collection('tenants').doc(tenantId).collection('customerPortalGrants')
}

function sessionsCol(tenantId: string) {
  return adminDb.collection('tenants').doc(tenantId).collection('customerPortalSessions')
}

export async function getTenantPortalSettings(tenantId: string): Promise<CustomerPortalFeatureSettings> {
  const snap = await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('settings')
    .doc(CUSTOMER_PORTAL_SETTINGS_DOC)
    .get()

  return normalizePortalSettings(snap.exists ? snap.data() : DEFAULT_PORTAL_FEATURE_SETTINGS)
}

export async function setTenantPortalSettings(
  tenantId: string,
  patch: Partial<CustomerPortalFeatureSettings>
): Promise<CustomerPortalFeatureSettings> {
  const current = await getTenantPortalSettings(tenantId)
  const next = normalizePortalSettings({ ...current, ...patch })

  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('settings')
    .doc(CUSTOMER_PORTAL_SETTINGS_DOC)
    .set({ ...next, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

  return next
}

async function allocateShortCode(tenantId: string, portalId: string): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const shortCode = generateShortCode(6)
    const indexRef = adminDb.collection('portalShortCodes').doc(shortCode)
    const existing = await indexRef.get()

    if (existing.exists) continue

    await indexRef.set({
      tenantId,
      portalId,
      createdAt: FieldValue.serverTimestamp()
    })

    return shortCode
  }

  throw Object.assign(new Error('Unable to allocate short code'), { status: 500 })
}

async function findPrimaryPropertyId(tenantId: string, customerId: string, customerName: string) {
  const byId = await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('properties')
    .where('customerId', '==', customerId)
    .limit(1)
    .get()

  if (!byId.empty) return byId.docs[0]!.id

  if (customerName) {
    const byName = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('properties')
      .where('customerName', '==', customerName)
      .limit(1)
      .get()

    if (!byName.empty) return byName.docs[0]!.id
  }

  return null
}

async function createGrant(tenantId: string, portalId: string) {
  const rawToken = generateSecureToken(32)
  const ref = grantsCol(tenantId).doc()

  await ref.set({
    portalId,
    tokenHash: hashToken(rawToken),
    tokenPrefix: tokenPrefix(rawToken),
    status: 'active',
    issuedAt: FieldValue.serverTimestamp(),
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
    revokedBy: null,
    revokeReason: null
  })

  return { grantId: ref.id, rawToken, tokenPrefix: tokenPrefix(rawToken) }
}

export async function getPortalByCustomerId(tenantId: string, customerId: string) {
  const snap = await portalsCol(tenantId).where('customerId', '==', customerId).limit(1).get()

  if (snap.empty) return null

  return serializePortal(snap.docs[0]!.id, snap.docs[0]!.data(), tenantId)
}

export async function getPortalById(tenantId: string, portalId: string) {
  const snap = await portalsCol(tenantId).doc(portalId).get()

  if (!snap.exists) return null

  return serializePortal(snap.id, snap.data()!, tenantId)
}

export async function getActiveGrantForPortal(tenantId: string, portalId: string) {
  const snap = await grantsCol(tenantId)
    .where('portalId', '==', portalId)
    .where('status', '==', 'active')
    .limit(1)
    .get()

  if (snap.empty) return null

  return serializeGrant(snap.docs[0]!.id, snap.docs[0]!.data(), tenantId)
}

export async function getAdminPortalSummary(
  tenantId: string,
  customerId: string,
  options?: { includeSecureUrlToken?: string | null }
): Promise<PortalAdminSummary> {
  const [settings, portal] = await Promise.all([
    getTenantPortalSettings(tenantId),
    getPortalByCustomerId(tenantId, customerId)
  ])

  if (!portal) {
    return {
      portal: null,
      shortUrl: null,
      secureUrl: null,
      grantPrefix: null,
      tenantPortalEnabled: settings.enabled
    }
  }

  const grant = await getActiveGrantForPortal(tenantId, portal.id)

  return {
    portal,
    shortUrl: buildShortUrl(portal.shortCode),
    secureUrl: options?.includeSecureUrlToken
      ? buildSecurePortalUrl(portal.shortCode, options.includeSecureUrlToken)
      : null,
    grantPrefix: grant?.tokenPrefix || null,
    tenantPortalEnabled: settings.enabled
  }
}

export async function enableCustomerPortal(input: {
  tenantId: string
  customerId: string
  actorUid: string
  actorEmail?: string | null
}) {
  const settings = await getTenantPortalSettings(input.tenantId)

  if (!settings.enabled) {
    throw Object.assign(new Error('Customer Portal is disabled for this workspace. Enable it in Settings first.'), {
      status: 400
    })
  }

  const customerSnap = await adminDb
    .collection('tenants')
    .doc(input.tenantId)
    .collection('customers')
    .doc(input.customerId)
    .get()

  if (!customerSnap.exists) {
    throw Object.assign(new Error('Customer not found'), { status: 404 })
  }

  const existing = await getPortalByCustomerId(input.tenantId, input.customerId)

  if (existing && existing.status === 'active') {
    const grant = await getActiveGrantForPortal(input.tenantId, existing.id)

    return {
      portal: existing,
      grantToken: null as string | null,
      shortUrl: buildShortUrl(existing.shortCode),
      secureUrl: null as string | null,
      grantPrefix: grant?.tokenPrefix || null,
      alreadyEnabled: true
    }
  }

  const customer = customerSnap.data()!
  const primaryPropertyId = await findPrimaryPropertyId(
    input.tenantId,
    input.customerId,
    String(customer.name || '')
  )

  let portalId = existing?.id
  let shortCode = existing?.shortCode

  if (!portalId) {
    const portalRef = portalsCol(input.tenantId).doc()

    portalId = portalRef.id
    shortCode = await allocateShortCode(input.tenantId, portalId)

    await portalRef.set({
      customerId: input.customerId,
      primaryPropertyId,
      shortCode,
      status: 'active',
      portalNameOverride: null,
      enabledFeatures: null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: input.actorUid,
      updatedAt: FieldValue.serverTimestamp(),
      disabledAt: null,
      disabledBy: null,
      lastAccessAt: null,
      lastVerifiedAt: null
    })
  } else {
    await portalsCol(input.tenantId)
      .doc(portalId)
      .set(
        {
          status: 'active',
          primaryPropertyId,
          disabledAt: null,
          disabledBy: null,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      )
  }

  const { rawToken, tokenPrefix: prefix } = await createGrant(input.tenantId, portalId)
  const portal = (await getPortalById(input.tenantId, portalId))!

  await writePortalAuditEvent({
    tenantId: input.tenantId,
    portalId,
    customerId: input.customerId,
    action: 'portal.enabled',
    actor: { type: 'staff', id: input.actorUid, email: input.actorEmail || null },
    metadata: { shortCode, grantPrefix: prefix }
  })

  return {
    portal,
    grantToken: rawToken,
    shortUrl: buildShortUrl(portal.shortCode),
    secureUrl: buildSecurePortalUrl(portal.shortCode, rawToken),
    grantPrefix: prefix,
    alreadyEnabled: false
  }
}

export async function disableCustomerPortal(input: {
  tenantId: string
  portalId: string
  actorUid: string
  actorEmail?: string | null
}) {
  const portal = await getPortalById(input.tenantId, input.portalId)

  if (!portal) {
    throw Object.assign(new Error('Portal not found'), { status: 404 })
  }

  await portalsCol(input.tenantId)
    .doc(input.portalId)
    .set(
      {
        status: 'disabled',
        disabledAt: FieldValue.serverTimestamp(),
        disabledBy: input.actorUid,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  await revokePortalSessions(input.tenantId, input.portalId, input.actorUid, 'portal_disabled')
  await revokeActiveGrants(input.tenantId, input.portalId, input.actorUid, 'portal_disabled')

  await writePortalAuditEvent({
    tenantId: input.tenantId,
    portalId: input.portalId,
    customerId: portal.customerId,
    action: 'portal.disabled',
    actor: { type: 'staff', id: input.actorUid, email: input.actorEmail || null }
  })

  return getPortalById(input.tenantId, input.portalId)
}

async function revokeActiveGrants(tenantId: string, portalId: string, actorUid: string, reason: string) {
  const snap = await grantsCol(tenantId).where('portalId', '==', portalId).where('status', '==', 'active').get()
  const batch = adminDb.batch()

  for (const doc of snap.docs) {
    batch.set(
      doc.ref,
      {
        status: 'revoked',
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: actorUid,
        revokeReason: reason
      },
      { merge: true }
    )
  }

  if (!snap.empty) await batch.commit()
}

export async function revokePortalSessions(
  tenantId: string,
  portalId: string,
  actorUid: string,
  reason: string
) {
  const snap = await sessionsCol(tenantId).where('portalId', '==', portalId).get()
  const batch = adminDb.batch()
  let count = 0

  for (const doc of snap.docs) {
    if (doc.data().revokedAt) continue
    batch.set(
      doc.ref,
      {
        revokedAt: FieldValue.serverTimestamp(),
        revokeReason: reason,
        revokedBy: actorUid
      },
      { merge: true }
    )
    count += 1
  }

  if (count > 0) await batch.commit()

  return count
}

export async function rotatePortalAccess(input: {
  tenantId: string
  portalId: string
  actorUid: string
  actorEmail?: string | null
  reason?: string
  rotateShortCode?: boolean
}) {
  const portal = await getPortalById(input.tenantId, input.portalId)

  if (!portal) {
    throw Object.assign(new Error('Portal not found'), { status: 404 })
  }

  if (portal.status !== 'active') {
    throw Object.assign(new Error('Portal is not active'), { status: 400 })
  }

  const previousGrant = await getActiveGrantForPortal(input.tenantId, portal.id)

  await revokeActiveGrants(input.tenantId, portal.id, input.actorUid, input.reason || 'access_rotated')
  await revokePortalSessions(input.tenantId, portal.id, input.actorUid, input.reason || 'access_rotated')

  let shortCode = portal.shortCode

  if (input.rotateShortCode) {
    const oldIndex = adminDb.collection('portalShortCodes').doc(portal.shortCode)

    await oldIndex.delete().catch(() => undefined)
    shortCode = await allocateShortCode(input.tenantId, portal.id)
    await portalsCol(input.tenantId)
      .doc(portal.id)
      .set({ shortCode, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  }

  const { rawToken, tokenPrefix: prefix, grantId } = await createGrant(input.tenantId, portal.id)
  const updated = (await getPortalById(input.tenantId, portal.id))!

  await writePortalAuditEvent({
    tenantId: input.tenantId,
    portalId: portal.id,
    customerId: portal.customerId,
    action: 'portal.access_rotated',
    actor: { type: 'staff', id: input.actorUid, email: input.actorEmail || null },
    metadata: {
      reason: input.reason || 'access_rotated',
      previousGrantId: previousGrant?.id || null,
      newGrantId: grantId,
      shortCodeRotated: Boolean(input.rotateShortCode)
    }
  })

  return {
    portal: updated,
    grantToken: rawToken,
    shortUrl: buildShortUrl(shortCode),
    secureUrl: buildSecurePortalUrl(shortCode, rawToken),
    grantPrefix: prefix
  }
}

export { portalsCol, grantsCol, sessionsCol }
