import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { getStripe, isStripeConfigured } from '@libs/billing/stripe'

export async function POST() {
  try {
    const ctx = await requireActiveTenantContext()

    if (!isStripeConfigured()) {
      return NextResponse.json({
        ok: true,
        message: 'Stripe Customer Portal requires STRIPE_SECRET_KEY'
      })
    }

    const customerId = ctx.tenant.subscription?.stripeCustomerId

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer on this tenant yet' }, { status: 400 })
    }

    const stripe = getStripe()!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings`
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Portal failed' }, { status: 500 })
  }
}
