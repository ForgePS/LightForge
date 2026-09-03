import 'server-only'

import { FieldValue, type DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'
import { requireAssuranceLevel } from '@libs/customer-portal/verification'

export async function getPortalEnhancements(session: PortalSessionContext) {
  const settings = await getTenantPortalSettings(session.tenantId)
  const ctx = await loadPortalCustomerContext(session)

  const [reviewsSnap, referralsSnap, arrivalJobs] = await Promise.all([
    adminDb.collection('tenants').doc(ctx.tenantId).collection('reviews').limit(20).get(),
    adminDb.collection('tenants').doc(ctx.tenantId).collection('referralInvites').limit(20).get().catch(() => null),
    adminDb.collection('tenants').doc(ctx.tenantId).collection('jobs').limit(50).get()
  ])

  const myReviews = reviewsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(row => belongsToPortalCustomer(row, ctx))
    .map(row => ({
      id: row.id,
      rating: Number(row.rating || 0),
      notes: row.customerVisibleNotes ? String(row.customerVisibleNotes) : null,
      createdAt: asIso(row.createdAt)
    }))

  const referrals = referralsSnap
    ? referralsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
        .filter(row => String(row.customerId || '') === ctx.customerId || String(row.customerName || '') === ctx.customerName)
        .map(row => ({
          id: row.id,
          friendName: row.friendName ? String(row.friendName) : null,
          status: String(row.status || 'pending'),
          createdAt: asIso(row.createdAt)
        }))
    : []

  const enRoute = settings.technicianArrivalStatus
    ? arrivalJobs.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
        .filter(job => belongsToPortalCustomer(job, ctx))
        .filter(job => job.technicianEnRoute === true || job.status === 'en_route')
        .map(job => ({
          jobTitle: String(job.title || 'Service visit'),
          crewFirstName: job.crewFirstName ? String(job.crewFirstName) : null,
          etaWindow: job.arrivalWindow ? String(job.arrivalWindow) : job.etaWindow ? String(job.etaWindow) : null,
          weatherNotice: job.weatherNotice ? String(job.weatherNotice) : null
        }))
    : []

  const weatherNotices = arrivalJobs.docs
    .map(doc => doc.data())
    .filter(job => belongsToPortalCustomer(job, ctx))
    .filter(job => job.weatherNotice)
    .map(job => ({
      title: String(job.title || 'Appointment'),
      notice: String(job.weatherNotice),
      date: job.scheduledDate ? String(job.scheduledDate) : null
    }))

  // Autopay / saved methods — consent records only in Phase 6
  const billingPrefs = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('customers')
    .doc(ctx.customerId)
    .get()

  const prefs = billingPrefs.exists ? billingPrefs.data() || {} : {}

  return {
    features: {
      referrals: settings.referrals,
      reviews: settings.reviews,
      technicianArrival: settings.technicianArrivalStatus,
      savedPaymentMethods: settings.savedPaymentMethods,
      autopay: settings.autopay
    },
    reviews: myReviews,
    referrals,
    arrivals: enRoute,
    weatherNotices,
    billingPreferences: {
      savedPaymentMethodOnFile: Boolean(prefs.stripePaymentMethodId),
      autopayEnabled: Boolean(prefs.autopayEnabled),
      autopayConsentAt: asIso(prefs.autopayConsentAt)
    }
  }
}

export async function submitPortalReview(
  session: PortalSessionContext,
  input: { rating: number; notes?: string }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.reviews) throw Object.assign(new Error('Reviews are not available'), { status: 403 })

  const rating = Number(input.rating || 0)

  if (rating < 1 || rating > 5) throw Object.assign(new Error('Choose a rating from 1 to 5'), { status: 400 })

  const ctx = await loadPortalCustomerContext(session)
  const ref = adminDb.collection('tenants').doc(ctx.tenantId).collection('reviews').doc()

  await ref.set({
    customerName: ctx.customerName,
    customerId: ctx.customerId,
    propertyName: ctx.propertyName,
    rating,
    source: 'customer_portal',
    customerVisibleNotes: input.notes ? String(input.notes) : null,
    notes: input.notes ? String(input.notes) : null,
    referralCreditCents: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.review_submitted',
    actor: { type: 'customer' },
    metadata: { rating, reviewId: ref.id }
  })

  return { id: ref.id }
}

export async function submitPortalReferral(
  session: PortalSessionContext,
  input: { friendName: string; friendEmail?: string; friendPhone?: string }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.referrals) throw Object.assign(new Error('Referrals are not available'), { status: 403 })

  const friendName = String(input.friendName || '').trim()

  if (friendName.length < 2) throw Object.assign(new Error('Enter your friend\'s name'), { status: 400 })

  const ctx = await loadPortalCustomerContext(session)
  const ref = adminDb.collection('tenants').doc(ctx.tenantId).collection('referralInvites').doc()

  await ref.set({
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    friendName,
    friendEmail: input.friendEmail ? String(input.friendEmail) : null,
    friendPhone: input.friendPhone ? String(input.friendPhone) : null,
    status: 'pending',
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Referral from ${ctx.customerName}`,
      body: `${friendName}${input.friendEmail ? ` · ${input.friendEmail}` : ''}`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.referral_submitted',
    actor: { type: 'customer' },
    metadata: { referralId: ref.id }
  })

  return { id: ref.id, status: 'pending' as const }
}

export async function updateAutopayPreference(
  session: PortalSessionContext,
  input: { enabled: boolean; consent: boolean }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.autopay) throw Object.assign(new Error('Autopay is not available'), { status: 403 })

  await requireAssuranceLevel(3)

  if (input.enabled && !input.consent) {
    throw Object.assign(new Error('Consent is required to enable autopay'), { status: 400 })
  }

  const ctx = await loadPortalCustomerContext(session)

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('customers')
    .doc(ctx.customerId)
    .set(
      {
        autopayEnabled: Boolean(input.enabled),
        autopayConsentAt: input.enabled ? new Date().toISOString() : null,
        autopayRevokedAt: input.enabled ? null : new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: input.enabled ? 'portal.autopay_enabled' : 'portal.autopay_disabled',
    actor: { type: 'customer' },
    metadata: {}
  })

  return getPortalEnhancements(session)
}
