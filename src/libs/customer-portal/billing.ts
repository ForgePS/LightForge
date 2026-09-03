import 'server-only'

import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { adminDb } from '@libs/firebase/admin'
import { getStripe, isStripeConfigured } from '@libs/billing/stripe'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext,
  type PortalCustomerContext
} from '@libs/customer-portal/context'
import { publicPortalBaseUrl } from '@libs/customer-portal/serialize'
import type { PortalSessionContext } from '@libs/customer-portal/session'
import { requireAssuranceLevel } from '@libs/customer-portal/verification'

export type PortalInvoiceSummary = {
  publicNumber: string
  title: string | null
  status: string
  customerStatus: string
  amountCents: number
  amountPaidCents: number
  amountDueCents: number
  dueDate: string | null
  pastDue: boolean
  jobTitle: string | null
  updatedAt: string | null
}

export type PortalPayment = {
  id: string
  publicNumber: string | null
  invoiceNumber: string | null
  amountCents: number
  status: string
  methodLabel: string | null
  paidAt: string | null
  receiptUrl: string | null
}

export type PortalInvoiceDetail = PortalInvoiceSummary & {
  lineItems: Array<{ name: string; amountCents: number }>
  creditsCents: number
  refundsCents: number
  payments: PortalPayment[]
  canPay: boolean
  receiptUrl: string | null
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function mapCustomerStatus(status: string, dueDate: string | null, amountDueCents: number) {
  if (status === 'paid') return 'Paid'
  if (status === 'void' || status === 'voided') return 'Voided'
  if (status === 'refunded') return 'Refunded'
  if (status === 'partially_paid') return 'Partially paid'
  if (amountDueCents > 0 && dueDate && dueDate < today()) return 'Past due'
  if (status === 'sent' || status === 'open') return 'Open'

  return 'Unavailable'
}

function amountPaid(data: DocumentData) {
  return Number(data.amountPaidCents || 0)
}

function amountDue(data: DocumentData) {
  const total = Number(data.amountCents || 0)
  const paid = amountPaid(data)
  const credits = Number(data.creditsCents || 0)
  const due = Math.max(0, total - paid - credits)

  if (['paid', 'void', 'voided'].includes(String(data.status || ''))) return 0

  return due
}

function summarize(id: string, data: DocumentData): PortalInvoiceSummary {
  const status = String(data.status || '')
  const dueDate = data.dueDate ? String(data.dueDate) : null
  const amountCents = Number(data.amountCents || 0)
  const amountPaidCents = amountPaid(data)
  const amountDueCents = amountDue(data)

  return {
    publicNumber: String(data.number || data.publicNumber || id),
    title: data.title ? String(data.title) : data.jobTitle ? String(data.jobTitle) : null,
    status,
    customerStatus: mapCustomerStatus(status, dueDate, amountDueCents),
    amountCents,
    amountPaidCents,
    amountDueCents,
    dueDate,
    pastDue: amountDueCents > 0 && Boolean(dueDate && dueDate < today()),
    jobTitle: data.jobTitle ? String(data.jobTitle) : null,
    updatedAt: asIso(data.updatedAt)
  }
}

async function findInvoice(ctx: PortalCustomerContext, publicNumber: string) {
  const byNumber = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('invoices')
    .where('number', '==', publicNumber)
    .limit(1)
    .get()

  if (!byNumber.empty) {
    return { id: byNumber.docs[0]!.id, data: byNumber.docs[0]!.data() }
  }

  const byPublic = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('invoices')
    .where('publicNumber', '==', publicNumber)
    .limit(1)
    .get()

  if (!byPublic.empty) {
    return { id: byPublic.docs[0]!.id, data: byPublic.docs[0]!.data() }
  }

  const byId = await adminDb.collection('tenants').doc(ctx.tenantId).collection('invoices').doc(publicNumber).get()

  if (byId.exists) return { id: byId.id, data: byId.data()! }

  return null
}

function assertVisibleInvoice(data: DocumentData, ctx: PortalCustomerContext) {
  if (!belongsToPortalCustomer(data, ctx)) {
    throw Object.assign(new Error('Invoice not found'), { status: 404 })
  }

  if (String(data.status || '') === 'draft') {
    throw Object.assign(new Error('Invoice not found'), { status: 404 })
  }
}

async function paymentsForInvoice(tenantId: string, invoiceId: string, invoiceNumber: string) {
  const snap = await adminDb.collection('tenants').doc(tenantId).collection('payments').limit(100).get()

  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(
      row =>
        String(row.invoiceId || '') === invoiceId ||
        String(row.invoiceNumber || '') === invoiceNumber
    )
    .map(row => mapPayment(row))
    .sort((a, b) => String(b.paidAt || '').localeCompare(String(a.paidAt || '')))
}

function mapPayment(row: DocumentData & { id: string }): PortalPayment {
  return {
    id: row.id,
    publicNumber: row.publicNumber ? String(row.publicNumber) : null,
    invoiceNumber: row.invoiceNumber ? String(row.invoiceNumber) : null,
    amountCents: Number(row.amountCents || 0),
    status: String(row.status || 'completed'),
    methodLabel: row.methodLabel ? String(row.methodLabel) : 'Card',
    paidAt: asIso(row.paidAt) || asIso(row.createdAt),
    receiptUrl: row.receiptUrl ? String(row.receiptUrl) : null
  }
}

export async function listPortalInvoices(session: PortalSessionContext) {
  const settings = await getTenantPortalSettings(session.tenantId)
  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('invoices').limit(100).get()

  const invoices = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(row => belongsToPortalCustomer(row, ctx))
    .filter(row => String(row.status || '') !== 'draft')
    .map(row => summarize(row.id, row))
    .sort((a, b) => String(b.dueDate || '').localeCompare(String(a.dueDate || '')))

  return {
    invoices,
    onlinePaymentsEnabled: settings.onlinePayments,
    billingSummary: {
      balanceCents: invoices.reduce((sum, inv) => sum + inv.amountDueCents, 0),
      openCount: invoices.filter(inv => inv.amountDueCents > 0).length
    }
  }
}

export async function getPortalInvoice(session: PortalSessionContext, publicNumber: string) {
  const settings = await getTenantPortalSettings(session.tenantId)
  const ctx = await loadPortalCustomerContext(session)
  const found = await findInvoice(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Invoice not found'), { status: 404 })
  assertVisibleInvoice(found.data, ctx)

  if (settings.forceVerificationForInvoices) {
    // Viewing invoices can require L2 in later phases; Phase 4 keeps list at L1 and forces L3 only for pay.
  }

  const summary = summarize(found.id, found.data)
  const payments = await paymentsForInvoice(ctx.tenantId, found.id, summary.publicNumber)
  const lineItems = Array.isArray(found.data.lineItems)
    ? found.data.lineItems.map((item: DocumentData) => ({
        name: String(item.name || 'Line item'),
        amountCents: Number(item.amountCents || 0)
      }))
    : [{ name: summary.title || summary.publicNumber, amountCents: summary.amountCents }]

  return {
    ...summary,
    lineItems,
    creditsCents: Number(found.data.creditsCents || 0),
    refundsCents: Number(found.data.refundsCents || 0),
    payments,
    canPay: settings.onlinePayments && summary.amountDueCents > 0 && !['void', 'voided'].includes(summary.status),
    receiptUrl: found.data.receiptUrl ? String(found.data.receiptUrl) : payments.find(p => p.receiptUrl)?.receiptUrl || null
  } satisfies PortalInvoiceDetail
}

export async function listPortalPayments(session: PortalSessionContext) {
  const ctx = await loadPortalCustomerContext(session)
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('payments').limit(100).get()

  const payments = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(row => belongsToPortalCustomer(row, ctx) || String(row.customerId || '') === ctx.customerId)
    .filter(row => String(row.status || '') !== 'failed')
    .map(row => mapPayment(row))
    .sort((a, b) => String(b.paidAt || '').localeCompare(String(a.paidAt || '')))

  return { payments }
}

export async function createPortalInvoiceCheckout(
  session: PortalSessionContext,
  publicNumber: string,
  input?: { idempotencyKey?: string }
) {
  await requireAssuranceLevel(3)

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.onlinePayments) {
    throw Object.assign(new Error('Online payments are not enabled'), { status: 403 })
  }

  if (!isStripeConfigured()) {
    throw Object.assign(
      new Error('Online payments are temporarily unavailable. Contact your lighting company to pay.'),
      { status: 503, code: 'STRIPE_NOT_CONFIGURED' }
    )
  }

  const ctx = await loadPortalCustomerContext(session)
  const found = await findInvoice(ctx, publicNumber)

  if (!found) throw Object.assign(new Error('Invoice not found'), { status: 404 })
  assertVisibleInvoice(found.data, ctx)

  const due = amountDue(found.data)

  if (due <= 0) {
    throw Object.assign(new Error('This invoice has no balance due'), { status: 400 })
  }

  const invoiceNumber = String(found.data.number || found.data.publicNumber || found.id)
  const idempotencyKey =
    input?.idempotencyKey || `portal-pay-${ctx.tenantId}-${found.id}-${due}-${Math.floor(Date.now() / 60000)}`

  // Reuse an open checkout if same idempotency key exists
  const existingPay = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('payments')
    .where('idempotencyKey', '==', idempotencyKey)
    .limit(1)
    .get()

  if (!existingPay.empty) {
    const row = existingPay.docs[0]!.data()

    if (row.status === 'completed') {
      return { status: 'already_paid' as const, checkoutUrl: null as string | null, paymentId: existingPay.docs[0]!.id }
    }

    if (row.checkoutUrl && row.status === 'pending') {
      return {
        status: 'pending' as const,
        checkoutUrl: String(row.checkoutUrl),
        paymentId: existingPay.docs[0]!.id
      }
    }
  }

  const stripe = getStripe()!
  const appUrl = publicPortalBaseUrl()
  const customerEmail = typeof ctx.customer.email === 'string' ? ctx.customer.email : undefined

  const checkout = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: due,
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: found.data.jobTitle ? String(found.data.jobTitle) : 'Lighting services'
            }
          }
        }
      ],
      success_url: `${appUrl}/portal/payments/${encodeURIComponent(invoiceNumber)}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/portal/payments/${encodeURIComponent(invoiceNumber)}?status=canceled`,
      metadata: {
        purpose: 'customer_portal_invoice',
        tenantId: ctx.tenantId,
        portalId: session.portal.id,
        customerId: ctx.customerId,
        customerName: ctx.customerName,
        invoiceId: found.id,
        invoiceNumber,
        amountCents: String(due),
        idempotencyKey
      },
      payment_intent_data: {
        metadata: {
          purpose: 'customer_portal_invoice',
          tenantId: ctx.tenantId,
          invoiceId: found.id,
          invoiceNumber,
          idempotencyKey
        }
      }
    },
    { idempotencyKey: idempotencyKey.slice(0, 255) }
  )

  const paymentRef = adminDb.collection('tenants').doc(ctx.tenantId).collection('payments').doc()

  await paymentRef.set({
    publicNumber: `PAY-${invoiceNumber}-${paymentRef.id.slice(0, 6).toUpperCase()}`,
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    invoiceId: found.id,
    invoiceNumber,
    amountCents: due,
    status: 'pending',
    methodLabel: 'Card',
    source: 'customer_portal',
    stripeCheckoutSessionId: checkout.id,
    checkoutUrl: checkout.url,
    idempotencyKey,
    portalId: session.portal.id,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await foundRefTouchPending(ctx.tenantId, found.id)

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.payment_initiated',
    actor: { type: 'customer' },
    metadata: {
      invoiceNumber,
      paymentId: paymentRef.id,
      amountCents: due,
      stripeCheckoutSessionId: checkout.id
    }
  })

  return {
    status: 'pending' as const,
    checkoutUrl: checkout.url,
    paymentId: paymentRef.id
  }
}

async function foundRefTouchPending(tenantId: string, invoiceId: string) {
  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('invoices')
    .doc(invoiceId)
    .set({ paymentPendingAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true })
}

export async function reconcilePortalCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.metadata?.purpose !== 'customer_portal_invoice') {
    return { handled: false as const }
  }

  const tenantId = session.metadata.tenantId
  const invoiceId = session.metadata.invoiceId
  const invoiceNumber = session.metadata.invoiceNumber
  const customerId = session.metadata.customerId
  const amountCents = Number(session.metadata.amountCents || session.amount_total || 0)
  const idempotencyKey = session.metadata.idempotencyKey || session.id

  if (!tenantId || !invoiceId) {
    return { handled: false as const }
  }

  const paymentsCol = adminDb.collection('tenants').doc(tenantId).collection('payments')
  const existingBySession = await paymentsCol.where('stripeCheckoutSessionId', '==', session.id).limit(1).get()
  const existingByKey = await paymentsCol.where('idempotencyKey', '==', idempotencyKey).limit(1).get()
  const existing = !existingBySession.empty ? existingBySession.docs[0]! : !existingByKey.empty ? existingByKey.docs[0]! : null

  if (existing?.data()?.status === 'completed') {
    return { handled: true as const, duplicate: true }
  }

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return { handled: true as const, duplicate: false, pending: true }
  }

  const receiptUrl =
    typeof session.invoice === 'string'
      ? null
      : session.payment_intent
        ? null
        : null

  // Try to get charge receipt from payment intent
  let finalReceiptUrl: string | null = receiptUrl
  const stripe = getStripe()

  if (stripe && typeof session.payment_intent === 'string') {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['latest_charge'] })
      const charge = pi.latest_charge

      if (charge && typeof charge !== 'string') {
        finalReceiptUrl = charge.receipt_url || null
      }
    } catch {
      // ignore receipt fetch failures
    }
  }

  const paidAt = new Date().toISOString()
  const paymentRef = existing?.ref || paymentsCol.doc()

  await paymentRef.set(
    {
      publicNumber: existing?.data()?.publicNumber || `PAY-${invoiceNumber}-${paymentRef.id.slice(0, 6).toUpperCase()}`,
      customerId: customerId || existing?.data()?.customerId || null,
      customerName: session.metadata.customerName || existing?.data()?.customerName || null,
      invoiceId,
      invoiceNumber,
      amountCents,
      status: 'completed',
      methodLabel: 'Card',
      source: 'customer_portal',
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      receiptUrl: finalReceiptUrl,
      idempotencyKey,
      portalId: session.metadata.portalId || null,
      paidAt,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: existing ? existing.data()?.createdAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  const invoiceRef = adminDb.collection('tenants').doc(tenantId).collection('invoices').doc(invoiceId)
  const invoiceSnap = await invoiceRef.get()

  if (invoiceSnap.exists) {
    const invoice = invoiceSnap.data()!
    const previousPaid = Number(invoice.amountPaidCents || 0)
    const nextPaid = previousPaid + amountCents
    const total = Number(invoice.amountCents || 0)
    const credits = Number(invoice.creditsCents || 0)
    const remaining = Math.max(0, total - nextPaid - credits)
    const nextStatus = remaining <= 0 ? 'paid' : 'partially_paid'

    await invoiceRef.set(
      {
        amountPaidCents: nextPaid,
        status: nextStatus,
        paidAt: remaining <= 0 ? paidAt : invoice.paidAt || null,
        receiptUrl: finalReceiptUrl || invoice.receiptUrl || null,
        paymentPendingAt: null,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )
  }

  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('messages')
    .add({
      to: session.customer_details?.email || session.customer_email || 'customer',
      channel: 'email',
      subject: `Payment received for ${invoiceNumber}`,
      body: `We received your payment of $${(amountCents / 100).toFixed(2)} for invoice ${invoiceNumber}. Thank you.`,
      status: 'sent',
      source: 'customer_portal_payment',
      customerId: customerId || null,
      customerName: session.metadata.customerName || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId,
    portalId: session.metadata.portalId || null,
    customerId: customerId || null,
    action: 'portal.payment_confirmed',
    actor: { type: 'system' },
    metadata: {
      invoiceId,
      invoiceNumber,
      paymentId: paymentRef.id,
      amountCents,
      stripeCheckoutSessionId: session.id
    }
  })

  return { handled: true as const, duplicate: false }
}

export async function getPortalPaymentStatus(
  session: PortalSessionContext,
  publicNumber: string,
  checkoutSessionId?: string | null
) {
  const detail = await getPortalInvoice(session, publicNumber)

  // Browser success redirect is never authoritative — optionally refresh from Stripe then rely on records
  if (checkoutSessionId && isStripeConfigured()) {
    const stripe = getStripe()!

    try {
      const checkout = await stripe.checkout.sessions.retrieve(checkoutSessionId)

      if (checkout.metadata?.purpose === 'customer_portal_invoice') {
        await reconcilePortalCheckoutSession(checkout)
      }
    } catch {
      // fall through to local records
    }
  }

  const refreshed = await getPortalInvoice(session, publicNumber)

  return {
    invoice: refreshed,
    processing: refreshed.amountDueCents > 0 && detail.canPay,
    paid: refreshed.amountDueCents <= 0 || refreshed.status === 'paid'
  }
}
