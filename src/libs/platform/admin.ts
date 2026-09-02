import { FieldValue } from 'firebase-admin/firestore'

import { normalizeBranding } from '@libs/branding/types'
import { adminAuth, adminDb } from '@libs/firebase/admin'
import { slugify } from '@libs/firebase/constants'
import type {
  MemberRole,
  PlatformAdminRecord,
  PlatformAnalytics,
  PlatformSettings,
  PlatformTenantSummary,
  PlatformUserSummary,
  SubscriptionPlan,
  TenantModuleCount,
  TenantStatus,
  TenantSubscription,
  TenantTemplateSummary,
  BillingOverview
} from '@libs/firebase/types'
import { DEFAULT_PLANS, buildDefaultSubscription, estimateMrrCents } from '@libs/subscriptions/plans'
import { addTenantMember, createTenant, ensureUserProfile } from '@libs/tenants/provision'
import { getDashboardStats } from '@libs/modules/crud'
import { MODULES } from '@libs/modules/registry'

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
  const [tenants, archivedTenants] = await Promise.all([listPlatformTenants(false), listPlatformTenants(true)])
  const mrrCents = tenants.reduce((sum, tenant) => sum + estimateMrrCents(tenant.subscription), 0)
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const monthMs = 30 * 24 * 60 * 60 * 1000

  const trialsExpiringSoon = tenants.filter(tenant => {
    const trialEndsAt = tenant.subscription.trialEndsAt

    if (!trialEndsAt) return false

    const ends = new Date(trialEndsAt).getTime()

    return ends >= now && ends <= now + weekMs
  })

  const newTenantsThisMonth = tenants.filter(tenant => {
    if (!tenant.createdAt) return false

    return now - new Date(tenant.createdAt).getTime() <= monthMs
  }).length

  return {
    tenantCount: tenants.length,
    activeCount: tenants.filter(t => t.status === 'active').length,
    trialCount: tenants.filter(t => t.status === 'trial' || t.subscription.status === 'trialing').length,
    suspendedCount: tenants.filter(t => t.status === 'suspended').length,
    canceledCount: tenants.filter(t => t.subscription.status === 'canceled').length,
    templateCount: tenants.filter(t => t.isTemplate).length,
    archivedCount: archivedTenants.filter(t => t.archivedAt).length,
    memberCount: tenants.reduce((sum, t) => sum + t.memberCount, 0),
    mrrCents,
    newTenantsThisMonth,
    trialsExpiringSoon,
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

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  supportEmail: 'support@lightforge.app',
  maintenanceMode: false,
  defaultTrialDays: 14,
  allowSelfServeSignup: true,
  platformName: 'LightForge'
}

export async function listPlatformUsers(): Promise<PlatformUserSummary[]> {
  const snap = await adminDb.collection('users').get()
  const results: PlatformUserSummary[] = []

  for (const doc of snap.docs) {
    const data = doc.data()
    const membershipsSnap = await doc.ref.collection('tenantMemberships').get()

    results.push({
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      activeTenantId: data.activeTenantId || null,
      isPlatformAdmin: Boolean(data.isPlatformAdmin),
      membershipCount: membershipsSnap.size,
      createdAt: toIso(data.createdAt)
    })
  }

  return results.sort((a, b) => a.email.localeCompare(b.email))
}

export async function listPlatformAdmins(): Promise<PlatformAdminRecord[]> {
  const snap = await adminDb.collection('platformAdmins').get()

  return snap.docs.map(doc => {
    const data = doc.data()

    return {
      uid: doc.id,
      email: data.email || '',
      createdAt: toIso(data.createdAt)
    }
  })
}

export async function revokePlatformAdmin(uid: string) {
  await adminDb.collection('platformAdmins').doc(uid).delete()

  const user = await adminAuth.getUser(uid).catch(() => null)

  if (user) {
    const claims = { ...(user.customClaims || {}) }

    delete claims.platformAdmin
    await adminAuth.setCustomUserClaims(uid, claims)
  }

  await adminDb.collection('users').doc(uid).set(
    {
      isPlatformAdmin: false,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )
}

export async function listTenantTemplates(): Promise<TenantTemplateSummary[]> {
  const snap = await adminDb.collection('tenantTemplates').get()
  const tenantNames = new Map<string, string>()
  const tenantSnap = await adminDb.collection('tenants').get()

  tenantSnap.docs.forEach(doc => tenantNames.set(doc.id, doc.data().name as string))

  return snap.docs.map(doc => {
    const data = doc.data()

    return {
      id: doc.id,
      name: data.name as string,
      sourceTenantId: data.sourceTenantId as string,
      sourceTenantName: tenantNames.get(data.sourceTenantId as string) || null,
      createdAt: toIso(data.createdAt)
    }
  })
}

export async function getTenantModuleCounts(tenantId: string): Promise<TenantModuleCount[]> {
  const counts = await Promise.all(
    MODULES.map(async mod => {
      const snap = await adminDb.collection('tenants').doc(tenantId).collection(mod.collection).count().get()

      return {
        collection: mod.collection,
        title: mod.title,
        count: snap.data().count
      }
    })
  )

  return counts.sort((a, b) => b.count - a.count)
}

export async function getTenantGeneralSettings(tenantId: string) {
  const snap = await adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general').get()

  if (!snap.exists) return {}

  const data = snap.data()!

  return {
    companyName: typeof data.companyName === 'string' ? data.companyName : undefined,
    timezone: typeof data.timezone === 'string' ? data.timezone : undefined,
    supportEmail: typeof data.supportEmail === 'string' ? data.supportEmail : undefined,
    branding: normalizeBranding(data.branding)
  }
}

export async function updateTenantGeneralSettings(tenantId: string, settings: Record<string, unknown>) {
  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('settings')
    .doc('general')
    .set({ ...settings, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

  return getTenantGeneralSettings(tenantId)
}

export async function getBillingOverview(): Promise<BillingOverview> {
  const tenants = await listPlatformTenants(true)
  const byStatus: Record<string, number> = {}
  const pastDueTenants: PlatformTenantSummary[] = []
  const trialingTenants: PlatformTenantSummary[] = []
  let stripeConnectedCount = 0
  let totalMrrCents = 0

  for (const tenant of tenants) {
    if (tenant.archivedAt) continue

    const status = tenant.subscription.status

    byStatus[status] = (byStatus[status] || 0) + 1

    if (status === 'past_due') pastDueTenants.push(tenant)
    if (status === 'trialing') trialingTenants.push(tenant)
    if (tenant.subscription.stripeCustomerId) stripeConnectedCount += 1
    totalMrrCents += estimateMrrCents(tenant.subscription)
  }

  return {
    byStatus,
    pastDueTenants,
    trialingTenants,
    stripeConnectedCount,
    totalMrrCents
  }
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const tenants = await listPlatformTenants(false)
  const moduleTotalsMap = new Map<string, TenantModuleCount>()
  let totalRecords = 0
  let openJobs = 0
  let pipelineCents = 0
  let unpaidCents = 0
  let openIssues = 0
  const tenantRecordCounts: Array<{ id: string; name: string; recordCount: number }> = []

  for (const tenant of tenants) {
    const counts = await getTenantModuleCounts(tenant.id)
    const recordCount = counts.reduce((sum, item) => sum + item.count, 0)

    tenantRecordCounts.push({ id: tenant.id, name: tenant.name, recordCount })
    totalRecords += recordCount

    counts.forEach(item => {
      const existing = moduleTotalsMap.get(item.collection)

      if (existing) {
        existing.count += item.count
      } else {
        moduleTotalsMap.set(item.collection, { ...item })
      }
    })

    const usage = await getDashboardStats(tenant.id)

    openJobs += usage.openJobs
    pipelineCents += usage.pipelineCents
    unpaidCents += usage.unpaidCents
    openIssues += usage.openIssues
  }

  const monthBuckets = new Map<string, number>()

  tenants.forEach(tenant => {
    if (!tenant.createdAt) return

    const month = tenant.createdAt.slice(0, 7)

    monthBuckets.set(month, (monthBuckets.get(month) || 0) + 1)
  })

  const tenantGrowth = [...monthBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, count }))

  return {
    moduleTotals: [...moduleTotalsMap.values()].sort((a, b) => b.count - a.count),
    totalRecords,
    aggregateUsage: { openJobs, pipelineCents, unpaidCents, openIssues },
    tenantGrowth,
    topTenantsByMembers: tenants
      .map(t => ({ id: t.id, name: t.name, memberCount: t.memberCount }))
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 5),
    topTenantsByRecords: tenantRecordCounts.sort((a, b) => b.recordCount - a.recordCount).slice(0, 5)
  }
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const snap = await adminDb.collection('platformSettings').doc('general').get()

  if (!snap.exists) return { ...DEFAULT_PLATFORM_SETTINGS }

  const data = snap.data()!

  return {
    supportEmail:
      typeof data.supportEmail === 'string' ? data.supportEmail : DEFAULT_PLATFORM_SETTINGS.supportEmail,
    maintenanceMode: Boolean(data.maintenanceMode),
    defaultTrialDays:
      typeof data.defaultTrialDays === 'number' ? data.defaultTrialDays : DEFAULT_PLATFORM_SETTINGS.defaultTrialDays,
    allowSelfServeSignup: data.allowSelfServeSignup !== false,
    platformName: typeof data.platformName === 'string' ? data.platformName : DEFAULT_PLATFORM_SETTINGS.platformName,
    branding: normalizeBranding(data.branding)
  }
}

export async function updatePlatformSettings(settings: Partial<PlatformSettings>) {
  await adminDb.collection('platformSettings').doc('general').set(
    {
      ...settings,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  return getPlatformSettings()
}
