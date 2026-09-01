import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

process.env.GOOGLE_CLOUD_PROJECT ||= process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lightforge-2cf3b'
process.env.GCLOUD_PROJECT ||= process.env.GOOGLE_CLOUD_PROJECT

import { FieldValue } from 'firebase-admin/firestore'

import { adminAuth, adminDb } from '../src/libs/firebase/admin'
import {
  DEMO_TENANT_SLUG,
  TEMPLATE_ID,
  YULETIDE_TENANT_SLUG
} from '../src/libs/firebase/constants'
import { grantPlatformAdmin, upsertSubscriptionPlans } from '../src/libs/platform/admin'
import { buildDefaultSubscription } from '../src/libs/subscriptions/plans'
import { buildDemoSeed } from '../src/libs/modules/seedData'
import { addTenantMember, createTenant, ensureUserProfile } from '../src/libs/tenants/provision'

async function ensureAuthUser(email: string, password: string, displayName: string) {
  try {
    const existing = await adminAuth.getUserByEmail(email)

    await adminAuth.updateUser(existing.uid, {
      password,
      displayName,
      emailVerified: true
    })

    return existing.uid
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code

    if (code !== 'auth/user-not-found') {
      throw error
    }

    const created = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true
    })

    return created.uid
  }
}

async function findTenantIdBySlug(slug: string) {
  const snap = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get()

  return snap.empty ? null : snap.docs[0]!.id
}

async function ensureSubscription(tenantId: string, subscription = buildDefaultSubscription()) {
  const ref = adminDb.collection('tenants').doc(tenantId)
  const snap = await ref.get()

  if (!snap.exists) return

  if (!snap.data()?.subscription) {
    await ref.set({ subscription, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  }
}


async function seedCollectionsIfEmpty(tenantId: string) {
  const customersSnap = await adminDb.collection('tenants').doc(tenantId).collection('customers').limit(1).get()

  if (!customersSnap.empty) {
    console.log('Skipping domain seed; customers already present', { tenantId })
    return
  }

  const seed = buildDemoSeed()

  for (const [collection, docs] of Object.entries(seed)) {
    const batch = adminDb.batch()

    docs.forEach((doc, index) => {
      const ref = adminDb.collection('tenants').doc(tenantId).collection(collection).doc(`seed-${index + 1}`)

      batch.set(ref, {
        ...doc,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
    })

    await batch.commit()
  }

  console.log('Seeded domain collections', { tenantId, collections: Object.keys(seed).length })
}

async function seedYuletide() {
  const email = process.env.SEED_YULETIDE_ADMIN_EMAIL || 'admin@yuletide.local'
  const password = process.env.SEED_YULETIDE_ADMIN_PASSWORD || 'YuletideAdmin!2026'
  const displayName = 'Yuletide Admin'
  const subscription = buildDefaultSubscription({
    planId: 'professional',
    status: 'active',
    billingInterval: 'month'
  })

  const uid = await ensureAuthUser(email, password, displayName)
  let tenantId = await findTenantIdBySlug(YULETIDE_TENANT_SLUG)

  if (!tenantId) {
    tenantId = await createTenant({
      name: 'Yuletide Lighting Co',
      slug: YULETIDE_TENANT_SLUG,
      status: 'active',
      isTemplate: false,
      createdFromTemplateId: null,
      subscription
    })

    await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('sampleItems')
      .doc('item-1')
      .set({
        title: 'Holiday install — Main Street',
        status: 'scheduled',
        createdAt: FieldValue.serverTimestamp()
      })
  } else {
    await ensureSubscription(tenantId, subscription)
  }

  await addTenantMember({
    tenantId,
    uid,
    email,
    displayName,
    role: 'owner'
  })
  await ensureUserProfile({
    uid,
    email,
    displayName,
    activeTenantId: tenantId
  })

  await seedCollectionsIfEmpty(tenantId)

  console.log('Yuletide Lighting Co ready', { tenantId, email })
}

async function seedLightForgeDemo() {
  const email = process.env.SEED_DEMO_ADMIN_EMAIL || 'demo@lightforge.app'
  const password = process.env.SEED_DEMO_ADMIN_PASSWORD || 'DemoAdmin!2026'
  const displayName = 'LightForge Demo Admin'
  const subscription = buildDefaultSubscription({
    planId: 'trial',
    status: 'trialing'
  })

  const uid = await ensureAuthUser(email, password, displayName)
  let tenantId = await findTenantIdBySlug(DEMO_TENANT_SLUG)

  if (!tenantId) {
    tenantId = await createTenant({
      name: 'LightForge Demo',
      slug: DEMO_TENANT_SLUG,
      status: 'active',
      isTemplate: true,
      createdFromTemplateId: null,
      subscription
    })

    const batch = adminDb.batch()
    const items = [
      { title: 'Demo project — Storefront', status: 'in_progress' },
      { title: 'Demo project — Warehouse', status: 'planned' },
      { title: 'Demo project — Event night', status: 'completed' }
    ]

    items.forEach((item, index) => {
      const ref = adminDb.collection('tenants').doc(tenantId!).collection('sampleItems').doc(`item-${index + 1}`)

      batch.set(ref, { ...item, createdAt: FieldValue.serverTimestamp() })
    })

    await batch.commit()
  } else {
    await ensureSubscription(tenantId, subscription)
  }

    await adminDb
    .collection('tenantTemplates')
    .doc(TEMPLATE_ID)
    .set(
      {
        id: TEMPLATE_ID,
        name: 'LightForge Demo',
        sourceTenantId: tenantId,
        seed: buildDemoSeed(),
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  await addTenantMember({
    tenantId,
    uid,
    email,
    displayName,
    role: 'owner'
  })
  await ensureUserProfile({
    uid,
    email,
    displayName,
    activeTenantId: tenantId
  })

  await seedCollectionsIfEmpty(tenantId)

  console.log('LightForge Demo template ready', { tenantId, templateId: TEMPLATE_ID, email })
}

async function seedPlatformAdmin() {
  const email = process.env.SEED_PLATFORM_ADMIN_EMAIL || 'admin@lightforge.app'
  const password = process.env.SEED_PLATFORM_ADMIN_PASSWORD || 'PlatformAdmin!2026'
  const displayName = 'LightForge Platform Admin'

  const uid = await ensureAuthUser(email, password, displayName)

  await ensureUserProfile({
    uid,
    email,
    displayName,
    activeTenantId: null
  })
  await grantPlatformAdmin(uid, email)

  console.log('Platform admin ready', { uid, email })
}

async function backfillMissingSubscriptions() {
  const snap = await adminDb.collection('tenants').get()

  for (const doc of snap.docs) {
    if (!doc.data().subscription) {
      await doc.ref.set(
        {
          subscription: buildDefaultSubscription({
            planId: doc.data().status === 'trial' ? 'trial' : 'starter',
            status: doc.data().status === 'trial' ? 'trialing' : 'active'
          }),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      )
    }
  }
}

async function main() {
  console.log('Seeding Firebase project', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  console.log('Firestore database', process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || 'lightforge')

  await upsertSubscriptionPlans()
  await seedYuletide()
  await seedLightForgeDemo()
  await seedPlatformAdmin()
  await backfillMissingSubscriptions()

  console.log('Seed complete')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
