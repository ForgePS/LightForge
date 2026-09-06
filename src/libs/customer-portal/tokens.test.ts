import { describe, expect, it } from 'vitest'

import {
  generateSecureToken,
  generateShortCode,
  hashToken,
  hashesEqual,
  tokenPrefix,
  tokensEqual
} from '@libs/customer-portal/tokens'

describe('customer-portal tokens', () => {
  it('hashes tokens with sha256 hex', () => {
    const token = 'demo-grant-token'
    const hash = hashToken(token)

    expect(hash).toHaveLength(64)
    expect(hash).toBe(hashToken(token))
    expect(hash).not.toBe(token)
  })

  it('compares hashes in constant time', () => {
    const hash = hashToken('abc')

    expect(hashesEqual(hash, hashToken('abc'))).toBe(true)
    expect(hashesEqual(hash, hashToken('xyz'))).toBe(false)
    expect(tokensEqual('same', 'same')).toBe(true)
    expect(tokensEqual('same', 'diff')).toBe(false)
  })

  it('generates url-safe secure tokens and short codes', () => {
    const token = generateSecureToken()

    expect(token.length).toBeGreaterThan(20)
    expect(token).not.toMatch(/[+/=]/)

    const code = generateShortCode(6)

    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/)
    expect(tokenPrefix(token, 8)).toBe(token.slice(0, 8))
  })
})
