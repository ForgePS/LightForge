import { describe, expect, it } from 'vitest'

import { shouldExposePortalDebugCode } from '@libs/customer-portal/notify'

describe('portal OTP debug exposure', () => {
  it('never exposes debug codes when ALLOW_PORTAL_DEBUG_OTP=false', () => {
    const previousAllow = process.env.ALLOW_PORTAL_DEBUG_OTP

    process.env.ALLOW_PORTAL_DEBUG_OTP = 'false'
    expect(shouldExposePortalDebugCode()).toBe(false)

    if (previousAllow === undefined) delete process.env.ALLOW_PORTAL_DEBUG_OTP
    else process.env.ALLOW_PORTAL_DEBUG_OTP = previousAllow
  })

  it('exposes debug codes when explicitly allowed', () => {
    const previousAllow = process.env.ALLOW_PORTAL_DEBUG_OTP

    process.env.ALLOW_PORTAL_DEBUG_OTP = 'true'
    expect(shouldExposePortalDebugCode()).toBe(true)

    if (previousAllow === undefined) delete process.env.ALLOW_PORTAL_DEBUG_OTP
    else process.env.ALLOW_PORTAL_DEBUG_OTP = previousAllow
  })
})
