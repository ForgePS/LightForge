import { describe, expect, it } from 'vitest'

import { normalizePortalSettings, DEFAULT_PORTAL_FEATURE_SETTINGS } from '@libs/customer-portal/settings-shared'

describe('normalizePortalSettings', () => {
  it('defaults to portal disabled with safe feature defaults', () => {
    const settings = normalizePortalSettings(undefined)

    expect(settings.enabled).toBe(false)
    expect(settings.onlinePayments).toBe(false)
    expect(settings.autopay).toBe(false)
    expect(settings.myLighting).toBe(true)
    expect(settings.sessionIdleMinutes).toBe(DEFAULT_PORTAL_FEATURE_SETTINGS.sessionIdleMinutes)
  })

  it('merges partial tenant settings without dropping defaults', () => {
    const settings = normalizePortalSettings({
      enabled: true,
      onlinePayments: true,
      portalDisplayName: 'Yuletide Portal',
      renewalLabel: 'Rebook for Next Season'
    })

    expect(settings.enabled).toBe(true)
    expect(settings.onlinePayments).toBe(true)
    expect(settings.portalDisplayName).toBe('Yuletide Portal')
    expect(settings.renewalLabel).toBe('Rebook for Next Season')
    expect(settings.messages).toBe(true)
    expect(settings.forceVerificationForInvoices).toBe(true)
  })
})
