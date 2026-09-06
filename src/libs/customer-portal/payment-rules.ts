export type CheckoutReconcilePlan =
  | { action: 'ignore' }
  | { action: 'pending' }
  | { action: 'duplicate' }
  | {
      action: 'complete'
      tenantId: string
      invoiceId: string
      invoiceNumber: string | null
      customerId: string | null
      amountCents: number
      idempotencyKey: string
      nextInvoice: { amountPaidCents: number; status: 'paid' | 'partially_paid'; remainingCents: number }
    }

/** Browser redirects are never authoritative — only Stripe webhook/session payment state is. */
export function planPortalCheckoutReconciliation(input: {
  purpose?: string | null
  paymentStatus?: string | null
  checkoutStatus?: string | null
  tenantId?: string | null
  invoiceId?: string | null
  invoiceNumber?: string | null
  customerId?: string | null
  amountCents?: number | null
  amountTotal?: number | null
  idempotencyKey?: string | null
  checkoutSessionId: string
  existingPaymentStatus?: string | null
  invoice?: { amountCents: number; amountPaidCents: number; creditsCents?: number } | null
}): CheckoutReconcilePlan {
  if (input.purpose !== 'customer_portal_invoice') {
    return { action: 'ignore' }
  }

  if (!input.tenantId || !input.invoiceId) {
    return { action: 'ignore' }
  }

  if (input.existingPaymentStatus === 'completed') {
    return { action: 'duplicate' }
  }

  const paid = input.paymentStatus === 'paid' || input.checkoutStatus === 'complete'

  if (!paid) {
    return { action: 'pending' }
  }

  const amountCents = Number(input.amountCents || input.amountTotal || 0)
  const previousPaid = Number(input.invoice?.amountPaidCents || 0)
  const total = Number(input.invoice?.amountCents || amountCents)
  const credits = Number(input.invoice?.creditsCents || 0)
  const nextPaid = previousPaid + amountCents
  const remaining = Math.max(0, total - nextPaid - credits)

  return {
    action: 'complete',
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    invoiceNumber: input.invoiceNumber || null,
    customerId: input.customerId || null,
    amountCents,
    idempotencyKey: input.idempotencyKey || input.checkoutSessionId,
    nextInvoice: {
      amountPaidCents: nextPaid,
      status: remaining <= 0 ? 'paid' : 'partially_paid',
      remainingCents: remaining
    }
  }
}

/** Success query params alone must never mark invoices paid. */
export function browserReturnIsAuthoritative() {
  return false
}
