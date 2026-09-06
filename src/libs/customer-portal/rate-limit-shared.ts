export type RateLimitDecision = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/** Pure helper for unit tests — given prior hits in a window, decide. */
export function evaluateRateLimitWindow(input: {
  hits: number[]
  nowMs: number
  windowMs: number
  limit: number
}): RateLimitDecision {
  const cutoff = input.nowMs - input.windowMs
  const recent = input.hits.filter(ts => ts > cutoff)

  if (recent.length >= input.limit) {
    const oldest = Math.min(...recent)
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + input.windowMs - input.nowMs) / 1000))

    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  return {
    allowed: true,
    remaining: Math.max(0, input.limit - recent.length - 1),
    retryAfterSeconds: 0
  }
}
