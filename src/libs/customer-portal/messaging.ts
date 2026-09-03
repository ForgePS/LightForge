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
import { buildShortUrl } from '@libs/customer-portal/serialize'
import type { PortalSessionContext } from '@libs/customer-portal/session'

export type PortalMessage = {
  id: string
  body: string
  direction: 'inbound' | 'outbound'
  createdAt: string | null
  readAt: string | null
}

export type PortalThread = {
  publicNumber: string
  subject: string
  updatedAt: string | null
  unread: boolean
  preview: string | null
}

function threadNumber(id: string) {
  return `MSG-${id.slice(0, 8).toUpperCase()}`
}

export async function listPortalThreads(session: PortalSessionContext) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.messages) {
    throw Object.assign(new Error('Messages are not available'), { status: 403 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('messageThreads').limit(50).get()

  let threads = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(row => belongsToPortalCustomer(row, ctx) || String(row.customerId || '') === ctx.customerId)
    .filter(row => row.customerVisible !== false && row.customerVisible !== 'false')
    .map(row => ({
      publicNumber: String(row.publicNumber || threadNumber(row.id)),
      subject: String(row.subject || 'Conversation'),
      updatedAt: asIso(row.updatedAt) || asIso(row.createdAt),
      unread: Boolean(row.customerUnread),
      preview: row.preview ? String(row.preview) : null
    }))
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))

  // Fallback: synthesize threads from customer-visible outbound/inbound message log
  if (threads.length === 0) {
    const messages = await adminDb.collection('tenants').doc(ctx.tenantId).collection('messages').limit(100).get()
    const relevant = messages.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
      .filter(
        row =>
          String(row.customerId || '') === ctx.customerId ||
          String(row.customerName || '') === ctx.customerName ||
          (typeof ctx.customer.email === 'string' && String(row.to || '') === ctx.customer.email)
      )
      .filter(row => row.source !== 'customer_portal_verification')
      .filter(row => row.internal !== true)

    const bySubject = new Map<string, DocumentData & { id: string }>()

    for (const row of relevant) {
      const key = String(row.threadId || row.subject || row.id)

      if (!bySubject.has(key)) bySubject.set(key, row)
    }

    threads = [...bySubject.values()].map(row => ({
      publicNumber: String(row.threadPublicNumber || threadNumber(row.threadId || row.id)),
      subject: String(row.subject || 'Message'),
      updatedAt: asIso(row.updatedAt) || asIso(row.createdAt),
      unread: false,
      preview: row.body ? String(row.body).slice(0, 120) : null
    }))
  }

  return { threads, unreadCount: threads.filter(t => t.unread).length }
}

async function findThread(ctx: Awaited<ReturnType<typeof loadPortalCustomerContext>>, publicNumber: string) {
  const byNumber = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messageThreads')
    .where('publicNumber', '==', publicNumber)
    .limit(1)
    .get()

  if (!byNumber.empty) {
    return { id: byNumber.docs[0]!.id, data: byNumber.docs[0]!.data(), synthetic: false as const }
  }

  const byId = await adminDb.collection('tenants').doc(ctx.tenantId).collection('messageThreads').doc(publicNumber).get()

  if (byId.exists) return { id: byId.id, data: byId.data()!, synthetic: false as const }

  return null
}

export async function getPortalThread(session: PortalSessionContext, publicNumber: string) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.messages) throw Object.assign(new Error('Messages are not available'), { status: 403 })

  const ctx = await loadPortalCustomerContext(session)
  const found = await findThread(ctx, publicNumber)

  if (!found) {
    // Synthetic thread from messages collection
    const messagesSnap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('messages').limit(100).get()
    const rows = messagesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
      .filter(
        row =>
          String(row.threadPublicNumber || threadNumber(row.threadId || row.id)) === publicNumber ||
          threadNumber(row.id) === publicNumber
      )
      .filter(row => row.internal !== true)

    if (rows.length === 0) throw Object.assign(new Error('Conversation not found'), { status: 404 })

    const messages: PortalMessage[] = rows
      .map(row => ({
        id: row.id,
        body: String(row.body || ''),
        direction: (row.source === 'customer_portal' || row.direction === 'inbound'
          ? 'inbound'
          : 'outbound') as 'inbound' | 'outbound',
        createdAt: asIso(row.createdAt),
        readAt: asIso(row.readAt)
      }))
      .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))

    return {
      publicNumber,
      subject: String(rows[0]?.subject || 'Conversation'),
      messages
    }
  }

  if (!belongsToPortalCustomer(found.data, ctx) && String(found.data.customerId || '') !== ctx.customerId) {
    throw Object.assign(new Error('Conversation not found'), { status: 404 })
  }

  const msgs = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messageThreads')
    .doc(found.id)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(200)
    .get()
    .catch(async () => {
      // Fallback unordered if index missing
      return adminDb
        .collection('tenants')
        .doc(ctx.tenantId)
        .collection('messageThreads')
        .doc(found.id)
        .collection('messages')
        .limit(200)
        .get()
    })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messageThreads')
    .doc(found.id)
    .set({ customerUnread: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

  const messages: PortalMessage[] = msgs.docs
    .map(doc => {
      const data = doc.data()

      return {
        id: doc.id,
        body: String(data.body || ''),
        direction: (data.direction === 'inbound' ? 'inbound' : 'outbound') as 'inbound' | 'outbound',
        createdAt: asIso(data.createdAt),
        readAt: asIso(data.readAt)
      }
    })
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))

  return {
    publicNumber: String(found.data.publicNumber || threadNumber(found.id)),
    subject: String(found.data.subject || 'Conversation'),
    messages
  }
}

export async function createPortalThread(
  session: PortalSessionContext,
  input: { subject: string; body: string }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.messages) throw Object.assign(new Error('Messages are not available'), { status: 403 })

  const subject = String(input.subject || '').trim() || 'Customer message'
  const body = String(input.body || '').trim()

  if (body.length < 2) throw Object.assign(new Error('Enter a message'), { status: 400 })

  const ctx = await loadPortalCustomerContext(session)
  const threadRef = adminDb.collection('tenants').doc(ctx.tenantId).collection('messageThreads').doc()
  const publicNumber = `MSG-${new Date().getFullYear()}-${threadRef.id.slice(0, 5).toUpperCase()}`

  await threadRef.set({
    publicNumber,
    subject,
    preview: body.slice(0, 120),
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    propertyId: ctx.propertyId,
    propertyName: ctx.propertyName,
    customerVisible: true,
    customerUnread: false,
    staffUnread: true,
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await threadRef.collection('messages').add({
    body,
    direction: 'inbound',
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp()
  })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Portal message: ${subject}`,
      body: `${ctx.customerName}: ${body}`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      threadPublicNumber: publicNumber,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  // Safe customer alert stub (no sensitive content)
  if (typeof ctx.customer.email === 'string' && ctx.customer.email) {
    await adminDb
      .collection('tenants')
      .doc(ctx.tenantId)
      .collection('messages')
      .add({
        to: ctx.customer.email,
        channel: 'email',
        subject: 'We received your message',
        body: `Thanks — your message was sent to the team. Continue in your portal: ${buildShortUrl(session.portal.shortCode)}`,
        status: 'sent',
        source: 'customer_portal_alert',
        customerId: ctx.customerId,
        customerName: ctx.customerName,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
  }

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.message_created',
    actor: { type: 'customer' },
    metadata: { publicNumber }
  })

  return { publicNumber }
}

export async function replyPortalThread(
  session: PortalSessionContext,
  publicNumber: string,
  bodyInput: string
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.messages) throw Object.assign(new Error('Messages are not available'), { status: 403 })

  const body = String(bodyInput || '').trim()

  if (body.length < 2) throw Object.assign(new Error('Enter a message'), { status: 400 })

  const ctx = await loadPortalCustomerContext(session)
  const found = await findThread(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Conversation not found'), { status: 404 })

  if (!belongsToPortalCustomer(found.data, ctx) && String(found.data.customerId || '') !== ctx.customerId) {
    throw Object.assign(new Error('Conversation not found'), { status: 404 })
  }

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messageThreads')
    .doc(found.id)
    .collection('messages')
    .add({
      body,
      direction: 'inbound',
      source: 'customer_portal',
      createdAt: FieldValue.serverTimestamp()
    })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messageThreads')
    .doc(found.id)
    .set(
      {
        preview: body.slice(0, 120),
        staffUnread: true,
        customerUnread: false,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Portal reply: ${found.data.subject || publicNumber}`,
      body: `${ctx.customerName}: ${body}`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      threadPublicNumber: publicNumber,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.message_replied',
    actor: { type: 'customer' },
    metadata: { publicNumber }
  })

  return getPortalThread(session, publicNumber)
}
