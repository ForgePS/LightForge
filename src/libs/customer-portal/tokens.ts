import 'server-only'

import { createHash, randomBytes, timingSafeEqual } from 'crypto'

const SHORT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function tokenPrefix(token: string, length = 8): string {
  return token.slice(0, length)
}

export function tokensEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

export function hashesEqual(a: string, b: string): boolean {
  return tokensEqual(a, b)
}

export function generateShortCode(length = 6): string {
  const bytes = randomBytes(length)
  let out = ''

  for (let i = 0; i < length; i++) {
    out += SHORT_CODE_ALPHABET[bytes[i]! % SHORT_CODE_ALPHABET.length]
  }

  return out
}
