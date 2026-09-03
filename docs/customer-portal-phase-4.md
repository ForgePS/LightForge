# Customer Portal — Phase 4 Billing & Payments

**Status:** Implemented  
**Depends on:** Phase 1–3  
**Spec sections:** §12

## What shipped

### Customer portal
- Invoice list + balance summary
- Invoice detail with line items, credits/refunds display, payment history
- **Pay Now** via Stripe Checkout (`mode: payment`)
- Level 3 OTP required before creating a Checkout session
- Return page reconciles with Stripe when possible, but **webhook is authoritative**
- Draft invoices never shown

### Payments pipeline
- `tenants/{id}/payments` records (`pending` → `completed`)
- Idempotent create + webhook reconciliation by Checkout session / idempotency key
- Invoice `amountPaidCents` + status (`partially_paid` / `paid`) updated on confirmed payment
- Receipt URL captured from Stripe charge when available
- Confirmation message written to `messages` log

### Staff CRM
- Invoice fields: paid amount, richer statuses, credits
- New **Payments** module (`/payments`)

### Webhook
- Existing `POST /api/billing/webhook` also handles `purpose=customer_portal_invoice`
- Handles `checkout.session.completed` and `checkout.session.async_payment_succeeded`

## Enablement

1. Settings → Customer Portal → enable **Online Payments**
2. Configure Stripe env vars (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)
3. Point Stripe webhook to `/api/billing/webhook` (include Checkout session events)
4. Re-seed or use Maple Grove `INV-2026-1108` as an open balance

## Try it

1. Open portal for Maple Grove HOA (or customer linked to `INV-2026-1108`)
2. Invoices → open deposit invoice → verify OTP → Pay
3. Complete Stripe Checkout (test card `4242…`)
4. Confirm webhook marks invoice paid and payment appears under Payments

## Notes

- Without Stripe keys, Pay returns a friendly unavailable error (no fake “paid” state)
- Browser `?status=success` alone never marks invoices paid
- Saved payment methods / autopay remain Phase 6
