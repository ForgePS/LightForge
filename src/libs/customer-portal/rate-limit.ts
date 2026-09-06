import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { evaluateRateLimitWindow, type RateLimitDecision } from '@libs/customer-portal/rate-limit-shared'

export type { RateLimitDecision }
export { evaluateRateLimitWindow }

function sanitizeKey(key: string) {
  return key.replace(/[^a-zA-Z0-9:_.-]/g, '_').slice(0, 180)
}

/**
 * Distributed rate limit using Firestore. Safe across App Hosting instances.
 */
export async function enforcePortalRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitDecision> {
  const now = Date.now()
  const ref = adminDb.collection('portalRateLimits').doc(sanitizeKey(input.key))

  const decision = await adminDb.runTransaction(async tx => {
    const snap = await tx.get(ref)
    const data = snap.exists ? snap.data() || {} : {}
    const hits = Array.isArray(data.hits) ? data.hits.map((v: unknown) => Number(v)).filter(Number.isFinite) : []
    const evaluated = evaluateRateLimitWindow({
      hits,
      nowMs: now,
      windowMs: input.windowMs,
      limit: input.limit
    })

    if (!evaluated.allowed) {
      return evaluated
    }

    const cutoff = now - input.windowMs
    const nextHits = [...hits.filter((ts: number) => ts > cutoff), now].slice(-input.limit)

    tx.set(
      ref,
      {
        hits: nextHits,
        updatedAt: FieldValue.serverTimestamp(),
        windowMs: input.windowMs,
        limit: input.limit
      },
      { merge: true }
    )

    return evaluated
  })

  if (!decision.allowed) {
    throw Object.assign(new Error('Too many requests. Please wait and try again.'), {
      status: 429,
      code: 'RATE_LIMITED',
      retryAfterSeconds: decision.retryAfterSeconds
    })
  }

  return decision
}

export function clientIpFromRequest(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}
