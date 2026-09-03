import 'server-only'

import type { DocumentData } from 'firebase-admin/firestore'

import type {
  AssuranceLevel,
  CustomerPortalGrant,
  CustomerPortalRecord,
  CustomerPortalSession,
  PortalStatus
} from '@libs/customer-portal/types'

function asIso(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  return undefined
}

export function serializePortal(id: string, data: DocumentData, tenantId: string): CustomerPortalRecord {
  return {
    id,
    tenantId,
    customerId: String(data.customerId || ''),
    primaryPropertyId: data.primaryPropertyId ? String(data.primaryPropertyId) : null,
    shortCode: String(data.shortCode || ''),
    status: (data.status || 'pending') as PortalStatus,
    portalNameOverride: data.portalNameOverride ? String(data.portalNameOverride) : null,
    enabledFeatures: Array.isArray(data.enabledFeatures) ? data.enabledFeatures.map(String) : null,
    createdAt: asIso(data.createdAt),
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    updatedAt: asIso(data.updatedAt),
    disabledAt: asIso(data.disabledAt) || null,
    disabledBy: data.disabledBy ? String(data.disabledBy) : null,
    lastAccessAt: asIso(data.lastAccessAt) || null,
    lastVerifiedAt: asIso(data.lastVerifiedAt) || null
  }
}

export function serializeGrant(id: string, data: DocumentData, tenantId: string): CustomerPortalGrant {
  return {
    id,
    tenantId,
    portalId: String(data.portalId || ''),
    tokenHash: String(data.tokenHash || ''),
    tokenPrefix: String(data.tokenPrefix || ''),
    status: (data.status || 'revoked') as CustomerPortalGrant['status'],
    issuedAt: asIso(data.issuedAt),
    expiresAt: asIso(data.expiresAt) || null,
    lastUsedAt: asIso(data.lastUsedAt) || null,
    revokedAt: asIso(data.revokedAt) || null,
    revokedBy: data.revokedBy ? String(data.revokedBy) : null,
    revokeReason: data.revokeReason ? String(data.revokeReason) : null
  }
}

export function serializeSession(id: string, data: DocumentData, tenantId: string): CustomerPortalSession {
  return {
    id,
    tenantId,
    portalId: String(data.portalId || ''),
    grantId: String(data.grantId || ''),
    sessionTokenHash: String(data.sessionTokenHash || ''),
    assuranceLevel: Number(data.assuranceLevel || 1) as AssuranceLevel,
    verifiedContactId: data.verifiedContactId ? String(data.verifiedContactId) : null,
    createdAt: asIso(data.createdAt),
    lastSeenAt: asIso(data.lastSeenAt),
    expiresAt: asIso(data.expiresAt),
    idleExpiresAt: asIso(data.idleExpiresAt),
    revokedAt: asIso(data.revokedAt) || null,
    riskFlags: Array.isArray(data.riskFlags) ? data.riskFlags.map(String) : []
  }
}

export function publicPortalBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ).replace(/\/$/, '')
}

export function buildShortUrl(shortCode: string): string {
  return `${publicPortalBaseUrl()}/p/${shortCode}`
}

export function buildSecurePortalUrl(shortCode: string, grantToken: string): string {
  return `${buildShortUrl(shortCode)}?g=${encodeURIComponent(grantToken)}`
}
