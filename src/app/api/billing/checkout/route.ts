import { NextResponse } from 'next/server'

import { requireActiveTenantContext } from '@libs/modules/crud'
import { getStripe, isStripeConfigured, priceIdForPlan } from '@libs/billing/stripe'
import type { SubscriptionPlanId } from '@libs/firebase/types'

export async function POST(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const planId = (body.planId || 'starter') as SubscriptionPlanId
    const interval = body.interval === 'year' ? 'year' : 'month'

    if (!isStripeConfigured()) {
      return NextResponse.json({
        ok: true,
        message:
          'Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs, or use Keep software / platform admin to activate.'
      })
    }

    const stripe = getStripe()!
    const priceId = priceIdForPlan(planId, interval)

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price ID for ${planId}/${interval}` },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    let customerId = ctx.tenant.subscription?.stripeCustomerId as string | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ctx.user.email,
        name: ctx.tenant.name,
        metadata: { tenantId: ctx.tenantId }
      })

      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings?billing=success`,
      cancel_url: `${appUrl}/settings?billing=cancel`,
      metadata: {
        tenantId: ctx.tenantId,
        planId
      },
      subscription_data: {
        metadata: {
          tenantId: ctx.tenantId,
          planId
        }
      }
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    console.error('checkout failed', error)

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 })
  }
}
