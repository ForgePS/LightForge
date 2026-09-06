import { describe, expect, it } from 'vitest'

import {
  assertSameTenant,
  canAccessInvoiceRecord,
  evaluateGrantExchange,
  evaluateSessionValidity
} from '@libs/customer-portal/access-rules'
import { hashToken } from '@libs/customer-portal/tokens'

describe('grant exchange', () => {
  const grantToken = 'grant-token-demo'
  const tokenHash = hashToken(grantToken)

  it('rejects missing short codes and disabled portals', () => {
    expect(
      evaluateGrantExchange({
        shortCodeResolved: false,
        tenantPortalEnabled: true,
        portalStatus: 'active',
        grants: [],
        grantToken
      }).ok
    ).toBe(false)

    expect(
      evaluateGrantExchange({
        shortCodeResolved: true,
        tenantPortalEnabled: false,
        portalStatus: 'active',
        grants: [{ id: 'g1', tokenHash, status: 'active' }],
        grantToken
      })
    ).toMatchObject({ ok: false, code: 'DISABLED' })
  })

  it('accepts a matching active grant and rejects rotated hashes', () => {
    const ok = evaluateGrantExchange({
      shortCodeResolved: true,
      tenantPortalEnabled: true,
      portalStatus: 'active',
      grants: [{ id: 'g1', tokenHash, status: 'active' }],
      grantToken
    })

    expect(ok).toEqual({ ok: true, grantId: 'g1' })

    expect(
      evaluateGrantExchange({
        shortCodeResolved: true,
        tenantPortalEnabled: true,
        portalStatus: 'active',
        grants: [{ id: 'g1', tokenHash: hashToken('old-rotated-token'), status: 'active' }],
        grantToken
      })
    ).toMatchObject({ ok: false, code: 'UNAUTHORIZED' })
  })

  it('rejects expired grants', () => {
    expect(
      evaluateGrantExchange({
        shortCodeResolved: true,
        tenantPortalEnabled: true,
        portalStatus: 'active',
        grants: [{ id: 'g1', tokenHash, status: 'active', expiresAt: '2020-01-01T00:00:00.000Z' }],
        grantToken,
        nowMs: Date.parse('2026-09-06T00:00:00.000Z')
      })
    ).toMatchObject({ ok: false, code: 'EXPIRED' })
  })
})

describe('session validity', () => {
  it('invalidates revoked, expired, idle, and disabled sessions', () => {
    const now = Date.parse('2026-09-06T12:00:00.000Z')

    expect(
      evaluateSessionValidity({
        portalStatus: 'active',
        tenantPortalEnabled: true,
        revokedAt: '2026-09-06T11:00:00.000Z',
        nowMs: now
      }).reason
    ).toBe('revoked')

    expect(
      evaluateSessionValidity({
        portalStatus: 'active',
        tenantPortalEnabled: true,
        expiresAt: '2026-09-06T11:00:00.000Z',
        nowMs: now
      }).reason
    ).toBe('expired')

    expect(
      evaluateSessionValidity({
        portalStatus: 'active',
        tenantPortalEnabled: true,
        idleExpiresAt: '2026-09-06T11:59:00.000Z',
        nowMs: now
      }).reason
    ).toBe('idle')

    expect(
      evaluateSessionValidity({
        portalStatus: 'disabled',
        tenantPortalEnabled: true,
        nowMs: now
      }).reason
    ).toBe('portal_inactive')
  })
})

describe('cross-customer invoice isolation', () => {
  it('hides drafts and other customers invoices even with a guessed public number', () => {
    const anderson = {
      customerId: 'cust_anderson',
      customerName: 'Anderson Residence',
      propertyNames: ['Anderson Main Home']
    }

    expect(
      canAccessInvoiceRecord({
        ...anderson,
        record: { number: 'INV-LEAK', customerId: 'cust_maple', customerName: 'Anderson Residence', status: 'sent' }
      })
    ).toBe(false)

    expect(
      canAccessInvoiceRecord({
        ...anderson,
        record: { number: 'INV-2026-1108', customerName: 'Maple Grove HOA', status: 'sent' }
      })
    ).toBe(false)

    expect(
      canAccessInvoiceRecord({
        ...anderson,
        record: { number: 'INV-SECRET', customerId: 'cust_anderson', status: 'draft' }
      })
    ).toBe(false)

    expect(
      canAccessInvoiceRecord({
        ...anderson,
        record: { number: 'INV-2026-1042', customerId: 'cust_anderson', status: 'sent' }
      })
    ).toBe(true)
  })

  it('enforces tenant id equality for metadata-scoped payment updates', () => {
    expect(assertSameTenant('tenant_a', 'tenant_a')).toBe(true)
    expect(assertSameTenant('tenant_a', 'tenant_b')).toBe(false)
    expect(assertSameTenant('tenant_a', null)).toBe(false)
  })
})
