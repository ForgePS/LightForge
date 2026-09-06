import { describe, expect, it } from 'vitest'

import {
  effectiveAssuranceLevel,
  mapPortalInvoiceStatus,
  mapPortalServiceStatus
} from '@libs/customer-portal/status-mappers'

describe('status mappers', () => {
  it('maps invoice customer statuses including past due', () => {
    expect(mapPortalInvoiceStatus('paid', null, 0)).toBe('Paid')
    expect(mapPortalInvoiceStatus('sent', '2099-01-01', 5000)).toBe('Open')
    expect(mapPortalInvoiceStatus('open', '2020-01-01', 5000)).toBe('Past due')
    expect(mapPortalInvoiceStatus('draft', null, 0)).toBe('Unavailable')
  })

  it('maps service request statuses for customers', () => {
    expect(mapPortalServiceStatus('new')).toBe('Submitted')
    expect(mapPortalServiceStatus('en_route')).toBe('Technician En Route')
    expect(mapPortalServiceStatus('resolved')).toBe('Completed')
  })

  it('enforces expired level-3 step-up', () => {
    const now = Date.parse('2026-09-06T12:00:00.000Z')

    expect(
      effectiveAssuranceLevel({
        sessionLevel: 3,
        minLevel: 3,
        assuranceLevelExpiresAt: '2026-09-06T11:00:00.000Z',
        nowMs: now
      })
    ).toEqual({ effective: 2, allowed: false })

    expect(
      effectiveAssuranceLevel({
        sessionLevel: 3,
        minLevel: 3,
        assuranceLevelExpiresAt: '2026-09-06T13:00:00.000Z',
        nowMs: now
      })
    ).toEqual({ effective: 3, allowed: true })
  })
})
