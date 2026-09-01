import { FieldValue } from 'firebase-admin/firestore'

import { adminAuth, adminDb } from '@libs/firebase/admin'
import { slugify } from '@libs/firebase/constants'
import type {
  MemberRole,
  PlatformTenantSummary,
  SubscriptionPlan,
  TenantStatus,
  TenantSubscription
} from '@libs/firebase/types'
import { DEFAULT_PLANS, buildDefaultSubscription, estimateMrrCents } from '@libs/subscriptions/plans'
import { addTenantMember, createTenant, ensureUserProfile } from '@libs/tenants/provision'

function toIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  return null
}

function normalizeSubscription(raw: Partial<TenantSubscription> | undefined): TenantSubscription {
  const fallback = buildDefaultSubscription()

  return {
    ...fallback,
    ...raw,
    planId: raw?.planId || fallback.planId,
    status: raw?.status || fallback.status,
    billingInterval: raw?.billingInterval || fallback.billingInterval,
    seats: raw?.seats ?? fallback.seats,
    priceCents: raw?.priceCents ?? fallback.priceCents,
    currentPeriodStart: raw?.currentPeriodStart ?? fallback.currentPeriodStart,
    currentPeriodEnd: raw?.currentPeriodEnd ?? fallback.currentPeriodEnd,
    trialEndsAt: raw?.trialEndsAt ?? fallback.trialEndsAt,
    cancelAtPeriodEnd: raw?.cancelAtPeriodEnd ?? false,
    notes: raw?.notes ?? '',
    stripeCustomerId: raw?.stripeCustomerId ?? null,
    stripeSubscriptionId: raw?.stripeSubscriptionId ?? null
  }
}

export async function isPlatformAdmin(uid: string) {
  const [claimUser, doc] = await Promise.all([
    adminAuth.getUser(uid).catch(() => null),
    adminDb.collection('platformAdmins').doc(uid).get()
  ])

  if (doc.exists) return true

  return Boolean(claimUser?.customClaims?.platformAdmin)
}

export async function grantPlatformAdmin(uid: string, email: string) {
  await adminDb.collection('platformAdmins').doc(uid).set(
    {
      uid,
      email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  const user = await adminAuth.getUser(uid)

  await adminAuth.setCustomUserClaims(uid, {
    ...(user.customClaims || {}),
    platformAdmin: true
  })

  await adminDb.collection('users').doc(uid).set(
    {
      isPlatformAdmin: true,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )
}

export async function listPlatformTenants(includeArchived = false): Promise<PlatformTenantSummary[]> {
  const snap = await adminDb.collection('tenants').orderBy('name').get()
  const results: PlatformTenantSummary[] = []

  for (const doc of snap.docs) {
    const data = doc.data()

    if (!includeArchived && data.archivedAt) {
      continue
    }

    const membersSnap = await doc.ref.collection('members').get()

    results.push({
      id: doc.id,
      name: data.name,
      slug: data.slug,
      status: data.status as TenantStatus,
      isTemplate: Boolean(data.isTemplate),
      memberCount: membersSnap.size,
      subscription: normalizeSubscription(data.subscription),
      archivedAt: toIso(data.archivedAt),
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt)
    })
  }

  return results
}

export async function getPlatformTenant(tenantId: string) {
  const ref = adminDb.collection('tenants').doc(tenantId)
  const snap = await ref.get()

  if (!snap.exists) {
    return null
  }

  const data = snap.data()!
  const membersSnap = await ref.collection('members').get()
  const members = membersSnap.docs.map(memberDoc => {
    const member = memberDoc.data()

    return {
      uid: memberDoc.id,
      email: member.email || '',
      displayName: member.displayName || '',
      role: member.role as MemberRole,
      joinedAt: toIso(member.joinedAt)
    }
  })

  return {
    id: snap.id,
    name: data.name as string,
    slug: data.slug as string,
    status: data.status as TenantStatus,
    isTemplate: Boolean(data.isTemplate),
    createdFromTemplateId: (data.createdFromTemplateId as string | null) || null,
    subscription: normalizeSubscription(data.subscription),
    members,
    archivedAt: toIso(data.archivedAt),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt)
  }
}

export async function updatePlatformTenant(
  tenantId: string,
  input: {
    name?: string
    slug?: string
    status?: TenantStatus
    isTemplate?: boolean
    archived?: boolean
  }
) {
  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp()
  }

  if (input.name !== undefined) updates.name = input.name.trim()
  if (input.slug !== undefined) updates.slug = slugify(input.slug) || input.slug
  if (input.status !== undefined) updates.status = input.status
  if (input.isTemplate !== undefined) updates.isTemplate = input.isTemplate
  if (input.archived === true) updates.archivedAt = FieldValue.serverTimestamp()
  if (input.archived === false) updates.archivedAt = null

  await adminDb.collection('tenants').doc(tenantId).update(updates)

  return getPlatformTenant(tenantId)
}

export async function updateTenantSubscription(tenantId: string, subscription: TenantSubscription) {
  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .set(
      {
        subscription: normalizeSubscription(subscription),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  return getPlatformTenant(tenantId)
}

export async function createPlatformTenant(input: {
  name: string
  slug?: string
  status?: TenantStatus
  isTemplate?: boolean
  ownerEmail?: string
  ownerPassword?: string
  ownerDisplayName?: string
  subscription?: Partial<TenantSubscription>
}) {
  const name = input.name.trim()
  const slug = slugify(input.slug || name) || `tenant-${Date.now().toString(36)}`
  const status = input.status || 'active'
  const subscription = normalizeSubscription({
    ...buildDefaultSubscription({
      planId: status === 'trial' ? 'trial' : 'starter',
      status: status === 'trial' ? 'trialing' : 'active'
    }),
    ...input.subscription
  })

  const tenantId = await createTenant({
    name,
    slug,
    status,
    isTemplate: input.isTemplate ?? false,
    createdFromTemplateId: null,
    subscription
  })

  if (input.ownerEmail && input.ownerPassword) {
    let uid: string

    try {
      const existing = await adminAuth.getUserByEmail(input.ownerEmail)

      uid = existing.uid
    } catch {
      const created = await adminAuth.createUser({
        email: input.ownerEmail,
        password: input.ownerPassword,
        displayName: input.ownerDisplayName || name,
        emailVerified: true
      })

      uid = created.uid
    }

    await addTenantMember({
      tenantId,
      uid,
      email: input.ownerEmail,
      displayName: input.ownerDisplayName || name,
      role: 'owner'
    })
    await ensureUserProfile({
      uid,
      email: input.ownerEmail,
      displayName: input.ownerDisplayName || name,
      activeTenantId: tenantId
    })
  }

  return getPlatformTenant(tenantId)
}

export async function getPlatformStats() {
  const tenants = await listPlatformTenants()
  const mrrCents = tenants.reduce((sum, tenant) => sum + estimateMrrCents(tenant.subscription), 0)

  return {
    tenantCount: tenants.length,
    activeCount: tenants.filter(t => t.status === 'active').length,
    trialCount: tenants.filter(t => t.status === 'trial' || t.subscription.status === 'trialing').length,
    suspendedCount: tenants.filter(t => t.status === 'suspended').length,
    templateCount: tenants.filter(t => t.isTemplate).length,
    memberCount: tenants.reduce((sum, t) => sum + t.memberCount, 0),
    mrrCents,
    plansInUse: tenants.reduce<Record<string, number>>((acc, tenant) => {
      const key = tenant.subscription.planId

      acc[key] = (acc[key] || 0) + 1

      return acc
    }, {})
  }
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const snap = await adminDb.collection('subscriptionPlans').get()

  if (snap.empty) {
    return DEFAULT_PLANS
  }

  return snap.docs.map(doc => {
    const data = doc.data()

    return {
      id: doc.id as SubscriptionPlan['id'],
      name: data.name,
      description: data.description || '',
      monthlyPriceCents: data.monthlyPriceCents ?? 0,
      yearlyPriceCents: data.yearlyPriceCents ?? 0,
      includedSeats: data.includedSeats ?? 1,
      features: data.features || [],
      active: data.active !== false
    }
  })
}

export async function upsertSubscriptionPlans(plans: SubscriptionPlan[] = DEFAULT_PLANS) {
  const batch = adminDb.batch()

  plans.forEach(plan => {
    batch.set(
      adminDb.collection('subscriptionPlans').doc(plan.id),
      {
        ...plan,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )
  })

  await batch.commit()
}
