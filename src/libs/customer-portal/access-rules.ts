import { hashesEqual, hashToken } from '@libs/customer-portal/tokens'

export type GrantExchangeDecision =
  | { ok: true; grantId: string }
  | { ok: false; status: number; code: 'NOT_FOUND' | 'DISABLED' | 'UNAUTHORIZED' | 'EXPIRED'; error: string }

export function evaluateGrantExchange(input: {
  shortCodeResolved: boolean
  tenantPortalEnabled: boolean
  portalStatus: string | null
  grants: Array<{ id: string; tokenHash: string; status: string; expiresAt?: string | null }>
  grantToken: string
  nowMs?: number
}): GrantExchangeDecision {
  if (!input.shortCodeResolved) {
    return { ok: false, status: 404, code: 'NOT_FOUND', error: 'Portal link is invalid or expired' }
  }

  if (!input.tenantPortalEnabled || input.portalStatus !== 'active') {
    return { ok: false, status: 403, code: 'DISABLED', error: 'This portal is currently unavailable' }
  }

  const now = input.nowMs ?? Date.now()
  const grantHash = hashToken(input.grantToken)
  const grant = input.grants.find(row => row.status === 'active' && hashesEqual(row.tokenHash, grantHash))

  if (!grant) {
    return { ok: false, status: 401, code: 'UNAUTHORIZED', error: 'Portal link is invalid or expired' }
  }

  if (grant.expiresAt && Date.parse(grant.expiresAt) < now) {
    return { ok: false, status: 401, code: 'EXPIRED', error: 'Portal link is invalid or expired' }
  }

  return { ok: true, grantId: grant.id }
}

export function evaluateSessionValidity(input: {
  revokedAt?: string | null
  expiresAt?: string | null
  idleExpiresAt?: string | null
  portalStatus: string | null
  tenantPortalEnabled: boolean
  nowMs?: number
}) {
  const now = input.nowMs ?? Date.now()

  if (input.revokedAt) return { valid: false as const, reason: 'revoked' }
  if (input.expiresAt && Date.parse(input.expiresAt) < now) return { valid: false as const, reason: 'expired' }
  if (input.idleExpiresAt && Date.parse(input.idleExpiresAt) < now) return { valid: false as const, reason: 'idle' }
  if (input.portalStatus !== 'active') return { valid: false as const, reason: 'portal_inactive' }
  if (!input.tenantPortalEnabled) return { valid: false as const, reason: 'tenant_disabled' }

  return { valid: true as const }
}

export function canAccessInvoiceRecord(input: {
  record: Record<string, unknown>
  customerId: string
  customerName: string
  propertyNames: string[]
}) {
  const { record, customerId, customerName, propertyNames } = input

  if (String(record.status || '') === 'draft') return false

  if (record.customerId && String(record.customerId) === customerId) return true
  if (record.customerName && String(record.customerName) === customerName) return true

  const propertyName = record.propertyName

  return Boolean(propertyName && propertyNames.includes(String(propertyName)))
}

export function assertSameTenant(sessionTenantId: string, resourceTenantId: string | null | undefined) {
  return Boolean(resourceTenantId && resourceTenantId === sessionTenantId)
}
