import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { adminDb } from '@libs/firebase/admin'
import { getStripe, subscriptionFromStripe } from '@libs/billing/stripe'
import type { SubscriptionPlanId, SubscriptionStatus } from '@libs/firebase/types'

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenantId
      const planId = (session.metadata?.planId || 'starter') as SubscriptionPlanId

      if (tenantId) {
        const subscription = subscriptionFromStripe({
          planId,
          status: 'active',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null
        })

        await adminDb.collection('tenants').doc(tenantId).set(
          {
            status: 'active',
            subscription,
            updatedAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        )
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const tenantId = sub.metadata?.tenantId

      if (tenantId) {
        const statusMap: Record<string, SubscriptionStatus> = {
          active: 'active',
          trialing: 'trialing',
          past_due: 'past_due',
          canceled: 'canceled',
          unpaid: 'past_due',
          paused: 'paused'
        }
        const planId = (sub.metadata?.planId || 'starter') as SubscriptionPlanId
        const subscription = subscriptionFromStripe({
          planId,
          status: event.type === 'customer.subscription.deleted' ? 'canceled' : statusMap[sub.status] || 'active',
          stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : null,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: (sub as unknown as { current_period_end?: number }).current_period_end || null
        })

        await adminDb.collection('tenants').doc(tenantId).set(
          {
            subscription,
            ...(subscription.status === 'canceled' ? { status: 'suspended' } : {}),
            updatedAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('webhook handler failed', error)

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
