import { describe, expect, it } from 'vitest'

import { derivePortalStatus, portalPrimaryAction } from '@libs/customer-portal/status-logic'

describe('derivePortalStatus', () => {
  it('prioritizes open service requests', () => {
    const status = derivePortalStatus({
      proposals: [],
      jobs: [{ type: 'install', status: 'scheduled', scheduledDate: '2026-11-10' }],
      issues: [{ status: 'open', title: 'Section out', createdAt: '2026-12-01' }],
      invoices: [],
      rebooking: [],
      removalLabel: 'Takedown'
    })

    expect(status.stage).toBe('service_open')
    expect(status.label).toBe('SERVICE REQUEST OPEN')
    expect(portalPrimaryAction(status.stage, 'Renew', 'Takedown').href).toBe('/portal/service')
  })

  it('maps proposal-ready and balance-due stages', () => {
    expect(
      derivePortalStatus({
        proposals: [{ status: 'sent', title: 'Holiday Package' }],
        jobs: [],
        issues: [],
        invoices: [],
        rebooking: [],
        removalLabel: 'Removal'
      }).stage
    ).toBe('proposal')

    expect(
      derivePortalStatus({
        proposals: [],
        jobs: [],
        issues: [],
        invoices: [{ status: 'sent', number: 'INV-1', dueDate: '2026-11-01' }],
        rebooking: [],
        removalLabel: 'Removal'
      }).stage
    ).toBe('deposit')
  })

  it('surfaces renewal after completed install', () => {
    const status = derivePortalStatus({
      proposals: [],
      jobs: [{ type: 'install', status: 'complete', scheduledDate: '2026-11-10' }],
      issues: [],
      invoices: [],
      rebooking: [{ status: 'new', requestedDate: '2027-11-01' }],
      removalLabel: 'Removal'
    })

    expect(status.stage).toBe('renewal')
    expect(portalPrimaryAction(status.stage, 'Rebook for Next Season', 'Removal').actionLabel).toBe(
      'Rebook for Next Season'
    )
  })
})
