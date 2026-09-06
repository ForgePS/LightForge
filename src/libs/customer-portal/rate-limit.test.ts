import { describe, expect, it } from 'vitest'

import { evaluateRateLimitWindow } from '@libs/customer-portal/rate-limit-shared'

describe('evaluateRateLimitWindow', () => {
  it('allows requests under the limit', () => {
    const now = 1_000_000

    expect(
      evaluateRateLimitWindow({
        hits: [now - 1000, now - 500],
        nowMs: now,
        windowMs: 60_000,
        limit: 5
      })
    ).toMatchObject({ allowed: true, remaining: 2 })
  })

  it('blocks when the window is full and reports retry-after', () => {
    const now = 1_000_000
    const windowMs = 60_000
    const hits = [now - 50_000, now - 40_000, now - 30_000]

    const result = evaluateRateLimitWindow({
      hits,
      nowMs: now,
      windowMs,
      limit: 3
    })

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })
})
