type ContactBody = {
  firstName?: string
  lastName?: string
  company?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
  websiteTrap?: string
}

const rateMap = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const key = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const limit = Number(config.formRateLimitPerHour || 20)
  const current = rateMap.get(key)

  if (!current || current.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 })
  } else if (current.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  } else {
    current.count += 1
  }

  const body = await readBody<ContactBody>(event)
  if (body?.websiteTrap) {
    return { ok: true }
  }

  const errors: string[] = []
  if (!body?.firstName?.trim()) errors.push('First name is required')
  if (!body?.lastName?.trim()) errors.push('Last name is required')
  if (!body?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email is required')
  if (!body?.subject?.trim()) errors.push('Subject is required')
  if (!body?.message?.trim()) errors.push('Message is required')

  if (errors.length) {
    throw createError({ statusCode: 400, statusMessage: errors.join('. ') })
  }

  console.info('[marketing/contact]', {
    at: new Date().toISOString(),
    email: body.email,
    subject: body.subject
  })

  return {
    ok: true,
    message: 'Thanks — your message was received.'
  }
})
