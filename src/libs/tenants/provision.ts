import { FieldValue } from 'firebase-admin/firestore'

import { adminAuth, adminDb } from '@libs/firebase/admin'
import { TEMPLATE_ID, slugify } from '@libs/firebase/constants'
import type { MemberRole, TenantStatus, TenantSubscription } from '@libs/firebase/types'
import { buildDefaultSubscription } from '@libs/subscriptions/plans'

type ProvisionTrialInput = {
  uid: string
  email: string
  displayName: string
  companyName?: string
}

export async function ensureUserProfile(input: {
  uid: string
  email: string
  displayName: string
  activeTenantId?: string | null
}) {
  const ref = adminDb.collection('users').doc(input.uid)
  const snap = await ref.get()

  if (snap.exists) {
    await ref.set(
      {
        email: input.email,
        displayName: input.displayName,
        updatedAt: FieldValue.serverTimestamp(),
        ...(input.activeTenantId !== undefined ? { activeTenantId: input.activeTenantId } : {})
      },
      { merge: true }
    )

    return
  }

  await ref.set({
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    activeTenantId: input.activeTenantId ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })
}

export async function addTenantMember(input: {
  tenantId: string
  uid: string
  email: string
  displayName: string
  role: MemberRole
}) {
  const memberPayload = {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    role: input.role,
    joinedAt: FieldValue.serverTimestamp()
  }

  const batch = adminDb.batch()

  batch.set(
    adminDb.collection('tenants').doc(input.tenantId).collection('members').doc(input.uid),
    memberPayload
  )
  batch.set(adminDb.collection('users').doc(input.uid).collection('tenantMemberships').doc(input.tenantId), {
    tenantId: input.tenantId,
    role: input.role,
    joinedAt: FieldValue.serverTimestamp()
  })

  await batch.commit()
}

export async function removeTenantMember(tenantId: string, uid: string) {
  const batch = adminDb.batch()

  batch.delete(adminDb.collection('tenants').doc(tenantId).collection('members').doc(uid))
  batch.delete(adminDb.collection('users').doc(uid).collection('tenantMemberships').doc(tenantId))

  const userSnap = await adminDb.collection('users').doc(uid).get()

  if (userSnap.data()?.activeTenantId === tenantId) {
    batch.set(
      adminDb.collection('users').doc(uid),
      { activeTenantId: null, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )
  }

  await batch.commit()
}

export async function updateTenantMemberRole(tenantId: string, uid: string, role: MemberRole) {
  const batch = adminDb.batch()

  batch.set(
    adminDb.collection('tenants').doc(tenantId).collection('members').doc(uid),
    { role, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )
  batch.set(
    adminDb.collection('users').doc(uid).collection('tenantMemberships').doc(tenantId),
    { role, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )

  await batch.commit()
}

export async function cloneTemplateSeed(tenantId: string) {
  const templateSnap = await adminDb.collection('tenantTemplates').doc(TEMPLATE_ID).get()

  if (!templateSnap.exists) {
    return
  }

  const seed = templateSnap.data()?.seed as Record<string, Array<Record<string, unknown>>> | undefined

  if (!seed) return

  for (const [collectionName, docs] of Object.entries(seed)) {
    if (!Array.isArray(docs) || !docs.length) continue

    let batch = adminDb.batch()
    let count = 0

    for (let index = 0; index < docs.length; index++) {
      const ref = adminDb.collection('tenants').doc(tenantId).collection(collectionName).doc()

      batch.set(ref, {
        ...docs[index],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
      count++

      if (count >= 400) {
        await batch.commit()
        batch = adminDb.batch()
        count = 0
      }
    }

    if (count) await batch.commit()
  }
}

export async function createTenant(input: {
  name: string
  slug: string
  status: TenantStatus
  isTemplate?: boolean
  createdFromTemplateId?: string | null
  subscription?: TenantSubscription
  archivedAt?: null
}) {
  const ref = adminDb.collection('tenants').doc()
  const subscription =
    input.subscription ||
    buildDefaultSubscription({
      planId: input.status === 'trial' ? 'trial' : 'starter',
      status: input.status === 'trial' ? 'trialing' : 'active'
    })

  await ref.set({
    name: input.name,
    slug: input.slug,
    status: input.status,
    isTemplate: input.isTemplate ?? false,
    createdFromTemplateId: input.createdFromTemplateId ?? null,
    subscription,
    archivedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  return ref.id
}

export async function findOwnedTenantId(uid: string) {
  const memberships = await adminDb.collection('users').doc(uid).collection('tenantMemberships').get()

  for (const doc of memberships.docs) {
    if (doc.data()?.role === 'owner') {
      return doc.id
    }
  }

  return null
}

export async function provisionTrialTenant(input: ProvisionTrialInput) {
  const existingOwned = await findOwnedTenantId(input.uid)

  if (existingOwned) {
    const tenantSnap = await adminDb.collection('tenants').doc(existingOwned).get()
    const data = tenantSnap.data()

    await ensureUserProfile({
      uid: input.uid,
      email: input.email,
      displayName: input.displayName,
      activeTenantId: existingOwned
    })

    return {
      tenantId: existingOwned,
      name: (data?.name as string) || 'Existing workspace',
      slug: (data?.slug as string) || existingOwned,
      status: (data?.status as 'trial') || 'trial',
      alreadyProvisioned: true as const
    }
  }

  const companyName = input.companyName?.trim() || `LightForge Demo — ${input.displayName || input.email}`
  const baseSlug = slugify(companyName) || `trial-${input.uid.slice(0, 8)}`
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const tenantId = await createTenant({
    name: companyName,
    slug,
    status: 'trial',
    isTemplate: false,
    createdFromTemplateId: TEMPLATE_ID
  })

  await cloneTemplateSeed(tenantId)
  await addTenantMember({
    tenantId,
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    role: 'owner'
  })
  await ensureUserProfile({
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    activeTenantId: tenantId
  })

  return { tenantId, name: companyName, slug, status: 'trial' as const, alreadyProvisioned: false as const }
}

export async function convertTenantToActive(input: {
  tenantId: string
  uid: string
  name?: string
  planId?: 'starter' | 'professional' | 'enterprise'
}) {
  const tenantRef = adminDb.collection('tenants').doc(input.tenantId)
  const memberRef = tenantRef.collection('members').doc(input.uid)

  const [tenantSnap, memberSnap] = await Promise.all([tenantRef.get(), memberRef.get()])

  if (!tenantSnap.exists) {
    throw new Error('Tenant not found')
  }

  if (!memberSnap.exists) {
    throw new Error('Not a member of this tenant')
  }

  const role = memberSnap.data()?.role as MemberRole

  if (!['owner', 'admin'].includes(role)) {
    throw new Error('Only owners or admins can convert a tenant')
  }

  const planId = input.planId || 'starter'
  const subscription = buildDefaultSubscription({
    planId,
    status: 'active',
    billingInterval: 'month'
  })

  const existingSub = tenantSnap.data()?.subscription || {}

  const updates: Record<string, unknown> = {
    status: 'active',
    subscription: {
      ...subscription,
      stripeCustomerId: existingSub.stripeCustomerId || null,
      stripeSubscriptionId: existingSub.stripeSubscriptionId || null,
      notes: existingSub.notes || 'Converted from trial'
    },
    updatedAt: FieldValue.serverTimestamp()
  }

  if (input.name?.trim()) {
    updates.name = input.name.trim()
    updates.slug = slugify(input.name.trim()) || tenantSnap.data()?.slug
  }

  await tenantRef.update(updates)

  return {
    tenantId: input.tenantId,
    status: 'active' as const,
    name: (updates.name as string) || tenantSnap.data()?.name,
    subscription: updates.subscription
  }
}

export async function setActiveTenant(uid: string, tenantId: string) {
  const memberSnap = await adminDb.collection('tenants').doc(tenantId).collection('members').doc(uid).get()

  if (!memberSnap.exists) {
    throw new Error('Not a member of this tenant')
  }

  await adminDb.collection('users').doc(uid).set(
    {
      activeTenantId: tenantId,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )
}

export async function inviteTenantMember(input: {
  tenantId: string
  email: string
  displayName?: string
  role: MemberRole
  password?: string
}) {
  const email = input.email.trim().toLowerCase()
  let uid: string
  let displayName = input.displayName || email.split('@')[0] || 'User'

  try {
    const existing = await adminAuth.getUserByEmail(email)

    uid = existing.uid
    displayName = existing.displayName || displayName
  } catch {
    const password = input.password || `Temp${Math.random().toString(36).slice(2, 10)}!`
    const created = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    })

    uid = created.uid
  }

  await addTenantMember({
    tenantId: input.tenantId,
    uid,
    email,
    displayName,
    role: input.role
  })
  await ensureUserProfile({
    uid,
    email,
    displayName
  })

  return { uid, email, displayName, role: input.role }
}
