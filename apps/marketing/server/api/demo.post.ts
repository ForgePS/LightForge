type DemoBody = {
  firstName?: string
  lastName?: string
  companyName?: string
  email?: string
  phone?: string
  website?: string
  primaryServices?: string[]
  approximateAnnualLightingRevenue?: string
  numberOfCrews?: string
  currentSoftware?: string
  message?: string
  websiteTrap?: string
}

const rateMap = new Map<string, { count: number; resetAt: number }>()

function clientKey(event: Parameters<typeof getRequestIP>[0]) {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

function validate(body: DemoBody) {
  const errors: string[] = []
  if (!body.firstName?.trim()) errors.push('First name is required')
  if (!body.lastName?.trim()) errors.push('Last name is required')
  if (!body.companyName?.trim()) errors.push('Company name is required')
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email is required')
  if (!body.phone?.trim()) errors.push('Phone is required')
  if (!body.primaryServices?.length) errors.push('Select at least one primary service')
  return errors
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const key = clientKey(event)
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const limit = Number(config.formRateLimitPerHour || 20)
  const current = rateMap.get(key)

  if (!current || current.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
  } else if (current.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  } else {
    current.count += 1
  }

  const body = await readBody<DemoBody>(event)

  // Honeypot — silent success for bots
  if (body.websiteTrap) {
    return { ok: true }
  }

  const errors = validate(body || {})
  if (errors.length) {
    throw createError({ statusCode: 400, statusMessage: errors.join('. ') })
  }

  // S1 stub: validate + log only. No CRM sync or email delivery yet.
  console.info('[marketing/demo]', {
    at: new Date().toISOString(),
    company: body.companyName,
    email: body.email,
    services: body.primaryServices
  })

  return {
    ok: true,
    message: 'Thanks — your demo request was received. We will follow up shortly.'
  }
})
