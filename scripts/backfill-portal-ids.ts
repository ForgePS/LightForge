import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

process.env.GOOGLE_CLOUD_PROJECT ||= process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lightforge-2cf3b'
process.env.GCLOUD_PROJECT ||= process.env.GOOGLE_CLOUD_PROJECT

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '../src/libs/firebase/admin'

const COLLECTIONS = [
  'properties',
  'proposals',
  'invoices',
  'jobs',
  'serviceIssues',
  'documents',
  'photos',
  'lightingItems',
  'rebookingRequests',
  'payments',
  'messageThreads',
  'reviews',
  'referralInvites',
  'addOnRequests'
] as const

type Args = {
  dryRun: boolean
  tenantId?: string
}

function parseArgs(argv: string[]): Args {
  const dryRun = argv.includes('--dry-run')
  const tenantFlag = argv.find(arg => arg.startsWith('--tenant='))

  return {
    dryRun,
    tenantId: tenantFlag ? tenantFlag.slice('--tenant='.length) : undefined
  }
}

async function loadCustomerMaps(tenantId: string) {
  const customers = await adminDb.collection('tenants').doc(tenantId).collection('customers').limit(500).get()
  const byName = new Map<string, string>()

  for (const doc of customers.docs) {
    const name = String(doc.data().name || '').trim()

    if (name && !byName.has(name)) byName.set(name, doc.id)
  }

  const properties = await adminDb.collection('tenants').doc(tenantId).collection('properties').limit(500).get()
  const propertyByName = new Map<string, { id: string; customerId: string | null; customerName: string | null }>()

  for (const doc of properties.docs) {
    const data = doc.data()
    const name = String(data.name || '').trim()

    if (name && !propertyByName.has(name)) {
      propertyByName.set(name, {
        id: doc.id,
        customerId: data.customerId ? String(data.customerId) : null,
        customerName: data.customerName ? String(data.customerName) : null
      })
    }
  }

  return { byName, propertyByName }
}

async function backfillTenant(tenantId: string, dryRun: boolean) {
  const { byName, propertyByName } = await loadCustomerMaps(tenantId)
  let scanned = 0
  let updated = 0

  // Ensure properties themselves get customerId when missing
  const propertiesSnap = await adminDb.collection('tenants').doc(tenantId).collection('properties').limit(500).get()

  for (const doc of propertiesSnap.docs) {
    scanned += 1
    const data = doc.data()
    const patch: Record<string, unknown> = {}

    if (!data.customerId && data.customerName) {
      const customerId = byName.get(String(data.customerName).trim())

      if (customerId) patch.customerId = customerId
    }

    if (Object.keys(patch).length === 0) continue

    updated += 1

    if (!dryRun) {
      await doc.ref.set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    }
  }

  // Refresh property map after property customerId fills
  const refreshed = await loadCustomerMaps(tenantId)

  for (const collection of COLLECTIONS) {
    if (collection === 'properties') continue

    const snap = await adminDb.collection('tenants').doc(tenantId).collection(collection).limit(500).get()

    for (const doc of snap.docs) {
      scanned += 1
      const data = doc.data()
      const patch: Record<string, unknown> = {}

      if (!data.customerId) {
        if (data.customerName) {
          const customerId = refreshed.byName.get(String(data.customerName).trim())

          if (customerId) patch.customerId = customerId
        } else if (data.propertyName) {
          const property = refreshed.propertyByName.get(String(data.propertyName).trim())

          if (property?.customerId) patch.customerId = property.customerId
          else if (property?.customerName) {
            const customerId = refreshed.byName.get(property.customerName)

            if (customerId) patch.customerId = customerId
          }
        }
      }

      if (!data.propertyId && data.propertyName) {
        const property = refreshed.propertyByName.get(String(data.propertyName).trim())

        if (property) patch.propertyId = property.id
      }

      if (Object.keys(patch).length === 0) continue

      updated += 1

      if (!dryRun) {
        await doc.ref.set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
      }
    }
  }

  return { tenantId, scanned, updated, dryRun }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const tenants = args.tenantId
    ? [{ id: args.tenantId }]
    : (await adminDb.collection('tenants').get()).docs.map(doc => ({ id: doc.id }))

  console.log(`Backfilling portal relation IDs for ${tenants.length} tenant(s)${args.dryRun ? ' (dry-run)' : ''}`)

  for (const tenant of tenants) {
    const result = await backfillTenant(tenant.id, args.dryRun)

    console.log(result)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
