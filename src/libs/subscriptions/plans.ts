import type { BillingInterval, SubscriptionPlan, SubscriptionPlanId, TenantSubscription } from '@libs/firebase/types'

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Trial',
    description: 'Fully functional evaluation workspace',
    monthlyPriceCents: 0,
    yearlyPriceCents: 0,
    includedSeats: 5,
    features: ['Full product access', 'Demo sample data', 'Convert to paid anytime'],
    active: true
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small lighting teams getting started',
    monthlyPriceCents: 4900,
    yearlyPriceCents: 49000,
    includedSeats: 5,
    features: ['Core modules', 'Email support', '5 seats'],
    active: true
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing operations and multi-crew work',
    monthlyPriceCents: 14900,
    yearlyPriceCents: 149000,
    includedSeats: 25,
    features: ['Everything in Starter', 'Priority support', '25 seats', 'Advanced reporting'],
    active: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom limits and dedicated support',
    monthlyPriceCents: 0,
    yearlyPriceCents: 0,
    includedSeats: 100,
    features: ['Custom pricing', 'SSO-ready later', 'Dedicated success', 'Unlimited seats available'],
    active: true
  }
]

export function getPlan(planId: SubscriptionPlanId, plans: SubscriptionPlan[] = DEFAULT_PLANS) {
  return plans.find(plan => plan.id === planId) || DEFAULT_PLANS[0]!
}

export function priceForPlan(plan: SubscriptionPlan, interval: BillingInterval) {
  return interval === 'year' ? plan.yearlyPriceCents : plan.monthlyPriceCents
}

export function buildDefaultSubscription(input?: {
  planId?: SubscriptionPlanId
  status?: TenantSubscription['status']
  billingInterval?: BillingInterval
  trialDays?: number
}): TenantSubscription {
  const planId = input?.planId || 'trial'
  const plan = getPlan(planId)
  const interval = input?.billingInterval || 'month'
  const now = new Date()
  const trialDays = input?.trialDays ?? (planId === 'trial' ? 14 : 0)
  const periodEnd = new Date(now)

  if (planId === 'trial' || input?.status === 'trialing') {
    periodEnd.setDate(periodEnd.getDate() + trialDays)
  } else if (interval === 'year') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  const status = input?.status || (planId === 'trial' ? 'trialing' : 'active')

  return {
    planId,
    status,
    billingInterval: interval,
    seats: plan.includedSeats,
    priceCents: priceForPlan(plan, interval),
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    trialEndsAt: status === 'trialing' ? periodEnd.toISOString() : null,
    cancelAtPeriodEnd: false,
    notes: '',
    stripeCustomerId: null,
    stripeSubscriptionId: null
  }
}

export function estimateMrrCents(subscription: TenantSubscription) {
  if (!['active', 'trialing', 'past_due'].includes(subscription.status)) {
    return 0
  }

  if (subscription.status === 'trialing' && (subscription.priceCents || 0) === 0) {
    return 0
  }

  const price = subscription.priceCents ?? 0

  if (subscription.billingInterval === 'year') {
    return Math.round(price / 12)
  }

  return price
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}
