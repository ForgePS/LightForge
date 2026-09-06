import { describe, expect, it } from 'vitest'

import { browserReturnIsAuthoritative, planPortalCheckoutReconciliation } from '@libs/customer-portal/payment-rules'

describe('portal payment webhook authority', () => {
  it('ignores non-portal checkout purposes and incomplete sessions', () => {
    expect(
      planPortalCheckoutReconciliation({
        purpose: 'tenant_subscription',
        checkoutSessionId: 'cs_1',
        tenantId: 't1',
        invoiceId: 'inv1',
        paymentStatus: 'paid'
      }).action
    ).toBe('ignore')

    expect(
      planPortalCheckoutReconciliation({
        purpose: 'customer_portal_invoice',
        checkoutSessionId: 'cs_1',
        tenantId: 't1',
        invoiceId: 'inv1',
        paymentStatus: 'unpaid',
        checkoutStatus: 'open'
      }).action
    ).toBe('pending')
  })

  it('never treats browser return params as payment authority', () => {
    expect(browserReturnIsAuthoritative()).toBe(false)
  })

  it('completes payment idempotently and updates invoice balances', () => {
    const first = planPortalCheckoutReconciliation({
      purpose: 'customer_portal_invoice',
      checkoutSessionId: 'cs_pay_1',
      tenantId: 't1',
      invoiceId: 'inv1',
      invoiceNumber: 'INV-1',
      customerId: 'cust_1',
      amountCents: 50000,
      paymentStatus: 'paid',
      checkoutStatus: 'complete',
      invoice: { amountCents: 100000, amountPaidCents: 0 }
    })

    expect(first).toMatchObject({
      action: 'complete',
      nextInvoice: { amountPaidCents: 50000, status: 'partially_paid', remainingCents: 50000 }
    })

    const second = planPortalCheckoutReconciliation({
      purpose: 'customer_portal_invoice',
      checkoutSessionId: 'cs_pay_1',
      tenantId: 't1',
      invoiceId: 'inv1',
      amountCents: 50000,
      paymentStatus: 'paid',
      existingPaymentStatus: 'completed',
      invoice: { amountCents: 100000, amountPaidCents: 50000 }
    })

    expect(second.action).toBe('duplicate')

    const final = planPortalCheckoutReconciliation({
      purpose: 'customer_portal_invoice',
      checkoutSessionId: 'cs_pay_2',
      tenantId: 't1',
      invoiceId: 'inv1',
      amountCents: 50000,
      paymentStatus: 'paid',
      invoice: { amountCents: 100000, amountPaidCents: 50000 }
    })

    expect(final).toMatchObject({
      action: 'complete',
      nextInvoice: { amountPaidCents: 100000, status: 'paid', remainingCents: 0 }
    })
  })
})
