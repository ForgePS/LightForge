import Stripe from 'stripe'

import { buildDefaultSubscription, getPlan, priceForPlan } from '@libs/subscriptions/plans'
import type { BillingInterval, SubscriptionPlanId, TenantSubscription } from '@libs/firebase/types'

let stripeClient: Stripe | null = null

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) return null

  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }

  return stripeClient
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

export function priceIdForPlan(planId: SubscriptionPlanId, interval: BillingInterval = 'month') {
  const map: Record<string, string | undefined> = {
    'starter:month': process.env.STRIPE_PRICE_STARTER_MONTHLY,
    'starter:year': process.env.STRIPE_PRICE_STARTER_YEARLY,
    'professional:month': process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    'professional:year': process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY,
    'enterprise:month': process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    'enterprise:year': process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
  }

  return map[`${planId}:${interval}`]
}

export function subscriptionFromStripe(input: {
  planId: SubscriptionPlanId
  status: TenantSubscription['status']
  interval?: BillingInterval
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  currentPeriodEnd?: number | null
}): TenantSubscription {
  const interval = input.interval || 'month'
  const base = buildDefaultSubscription({ planId: input.planId, status: input.status, billingInterval: interval })
  const plan = getPlan(input.planId)

  return {
    ...base,
    priceCents: priceForPlan(plan, interval),
    stripeCustomerId: input.stripeCustomerId || null,
    stripeSubscriptionId: input.stripeSubscriptionId || null,
    currentPeriodEnd: input.currentPeriodEnd
      ? new Date(input.currentPeriodEnd * 1000).toISOString()
      : base.currentPeriodEnd,
    trialEndsAt: input.status === 'trialing' ? base.trialEndsAt : null
  }
}
