import { FieldValue, type DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { getSessionUser } from '@libs/auth/session'
import { isValidCollection } from '@libs/modules/registry'

function serializeDoc(id: string, data: DocumentData) {
  const out: Record<string, unknown> = { id }

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
      out[key] = value.toDate().toISOString()
    } else {
      out[key] = value
    }
  }

  return out
}

export async function requireActiveTenantContext() {
  const user = await getSessionUser()

  if (!user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }

  if (!user.activeTenantId) {
    throw Object.assign(new Error('No active tenant'), { status: 400 })
  }

  const tenantSnap = await adminDb.collection('tenants').doc(user.activeTenantId).get()

  if (!tenantSnap.exists) {
    throw Object.assign(new Error('Tenant not found'), { status: 404 })
  }

  const tenant = tenantSnap.data()!
  const memberSnap = await tenantSnap.ref.collection('members').doc(user.uid).get()

  if (!memberSnap.exists && !user.isPlatformAdmin) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }

  return {
    user,
    tenantId: user.activeTenantId,
    tenant,
    role: (memberSnap.data()?.role as string) || (user.isPlatformAdmin ? 'admin' : 'member'),
    accessBlocked:
      tenant.status === 'suspended' ||
      ['canceled', 'paused'].includes(tenant.subscription?.status || '')
  }
}

export async function listRecords(tenantId: string, collection: string) {
  if (!isValidCollection(collection)) {
    throw Object.assign(new Error('Unknown collection'), { status: 400 })
  }

  const snap = await adminDb.collection('tenants').doc(tenantId).collection(collection).limit(500).get()

  return snap.docs.map(doc => serializeDoc(doc.id, doc.data()))
}

export async function getRecord(tenantId: string, collection: string, id: string) {
  const snap = await adminDb.collection('tenants').doc(tenantId).collection(collection).doc(id).get()

  if (!snap.exists) return null

  return serializeDoc(snap.id, snap.data()!)
}

export async function createRecord(tenantId: string, collection: string, data: Record<string, unknown>) {
  if (!isValidCollection(collection)) {
    throw Object.assign(new Error('Unknown collection'), { status: 400 })
  }

  const ref = adminDb.collection('tenants').doc(tenantId).collection(collection).doc()

  await ref.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  const snap = await ref.get()

  return serializeDoc(snap.id, snap.data()!)
}

export async function updateRecord(
  tenantId: string,
  collection: string,
  id: string,
  data: Record<string, unknown>
) {
  const ref = adminDb.collection('tenants').doc(tenantId).collection(collection).doc(id)
  const snap = await ref.get()

  if (!snap.exists) {
    throw Object.assign(new Error('Not found'), { status: 404 })
  }

  const { id: _id, createdAt: _c, ...rest } = data

  await ref.set(
    {
      ...rest,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  const updated = await ref.get()

  return serializeDoc(updated.id, updated.data()!)
}

export async function deleteRecord(tenantId: string, collection: string, id: string) {
  await adminDb.collection('tenants').doc(tenantId).collection(collection).doc(id).delete()
}

export async function getDashboardStats(tenantId: string) {
  const [jobs, proposals, invoices, schedule, issues] = await Promise.all([
    adminDb.collection('tenants').doc(tenantId).collection('jobs').get(),
    adminDb.collection('tenants').doc(tenantId).collection('proposals').get(),
    adminDb.collection('tenants').doc(tenantId).collection('invoices').get(),
    adminDb.collection('tenants').doc(tenantId).collection('scheduleEvents').get(),
    adminDb.collection('tenants').doc(tenantId).collection('serviceIssues').get()
  ])

  const today = new Date().toISOString().slice(0, 10)
  const openJobs = jobs.docs.filter(d => !['complete', 'cancelled'].includes(d.data().status)).length
  const pipelineCents = proposals.docs
    .filter(d => ['draft', 'sent'].includes(d.data().status))
    .reduce((sum, d) => sum + Number(d.data().amountCents || 0), 0)
  const unpaidCents = invoices.docs
    .filter(d => ['draft', 'sent'].includes(d.data().status))
    .reduce((sum, d) => sum + Number(d.data().amountCents || 0), 0)
  const scheduleToday = schedule.docs.filter(d => d.data().date === today).length
  const openIssues = issues.docs.filter(d => d.data().status !== 'resolved').length

  return {
    openJobs,
    pipelineCents,
    unpaidCents,
    scheduleToday,
    openIssues,
    recentJobs: jobs.docs.slice(0, 5).map(d => serializeDoc(d.id, d.data())),
    recentProposals: proposals.docs.slice(0, 5).map(d => serializeDoc(d.id, d.data()))
  }
}
