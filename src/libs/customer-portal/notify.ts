export type PortalNotifyChannel = 'email' | 'sms'

export type PortalNotifyResult = {
  delivered: boolean
  provider: 'resend' | 'twilio' | 'outbox'
  messageId?: string
}

function allowDebugOtp() {
  if (process.env.ALLOW_PORTAL_DEBUG_OTP === 'true') return true
  if (process.env.ALLOW_PORTAL_DEBUG_OTP === 'false') return false

  return process.env.NODE_ENV === 'development'
}

export function shouldExposePortalDebugCode() {
  return allowDebugOtp()
}

async function sendResendEmail(input: { to: string; subject: string; body: string }) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.PORTAL_OTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL

  if (!key || !from) return null

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.body
    })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')

    throw Object.assign(new Error(`Resend failed: ${res.status} ${text}`.slice(0, 200)), { status: 502 })
  }

  const data = (await res.json()) as { id?: string }

  return data.id || 'resend'
}

async function sendTwilioSms(input: { to: string; body: string }) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER

  if (!sid || !token || !from) return null

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const params = new URLSearchParams({ To: input.to, From: from, Body: input.body })
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')

    throw Object.assign(new Error(`Twilio failed: ${res.status} ${text}`.slice(0, 200)), { status: 502 })
  }

  const data = (await res.json()) as { sid?: string }

  return data.sid || 'twilio'
}

/**
 * Deliver portal OTP. Prefer Resend (email) / Twilio (sms) when configured.
 * Otherwise writes rely on the messages outbox for staff/ops tooling.
 */
export async function deliverPortalVerificationCode(input: {
  channel: PortalNotifyChannel
  destination: string
  code: string
}): Promise<PortalNotifyResult> {
  const subject = 'Your LightForge portal verification code'
  const body = `Your verification code is ${input.code}. It expires in 10 minutes. If you did not request this, ignore this message.`

  if (input.channel === 'email') {
    const id = await sendResendEmail({ to: input.destination, subject, body })

    if (id) return { delivered: true, provider: 'resend', messageId: id }
  }

  if (input.channel === 'sms') {
    const id = await sendTwilioSms({ to: input.destination, body })

    if (id) return { delivered: true, provider: 'twilio', messageId: id }
  }

  // Outbox-only: code is stored on the messages row for a delivery worker / staff ops.
  // In production without a provider, callers should treat this as queued, not user-visible.
  return { delivered: false, provider: 'outbox' }
}

export function portalVerificationRequiresProvider(channel: PortalNotifyChannel) {
  if (allowDebugOtp()) return false
  if (channel === 'email') return Boolean(process.env.RESEND_API_KEY && (process.env.PORTAL_OTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL))
  if (channel === 'sms') {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
  }

  return false
}

export function assertPortalVerificationDeliveryAvailable(channel: PortalNotifyChannel) {
  if (allowDebugOtp()) return
  if (channel === 'email' && !(process.env.RESEND_API_KEY && (process.env.PORTAL_OTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL))) {
    throw Object.assign(
      new Error('Email verification is not configured. Contact your lighting company.'),
      { status: 503, code: 'OTP_PROVIDER_MISSING' }
    )
  }

  if (
    channel === 'sms' &&
    !(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
  ) {
    throw Object.assign(
      new Error('SMS verification is not configured. Contact your lighting company.'),
      { status: 503, code: 'OTP_PROVIDER_MISSING' }
    )
  }
}
