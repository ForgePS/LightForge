# Customer Portal — Production Readiness

**Status:** In progress  
**App:** https://lightforge-app--lightforge-2cf3b.us-central1.hosted.app

## Done in code

- ID-strict authorization: records with `customerId` only match that customer (name cannot override)
- Home / renewal / properties prefer `customerId` queries with safe legacy name merge
- Staff module create/update dual-writes IDs from names
- OTP delivery via Resend (email) / Twilio (SMS) when configured
- Debug OTP codes only when `ALLOW_PORTAL_DEBUG_OTP=true` or local development (never by default in production)
- Production without a provider returns `503 OTP_PROVIDER_MISSING` instead of leaking codes
- Payment webhook remains authoritative; unit/integration-style tests cover grant + pay isolation
- Distributed rate limits (Firestore) on grant exchange, OTP send/confirm, and pay-create
- Backfill script: `pnpm backfill:portal-ids` (supports `--dry-run` and `--tenant=<id>`)

## Required before real customers

### 1. OTP provider secrets (App Hosting)

```bash
firebase apphosting:secrets:set RESEND_API_KEY --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess RESEND_API_KEY --backend lightforge-app --project lightforge-2cf3b
# and/or Twilio:
firebase apphosting:secrets:set TWILIO_ACCOUNT_SID --project lightforge-2cf3b
firebase apphosting:secrets:set TWILIO_AUTH_TOKEN --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess TWILIO_ACCOUNT_SID --backend lightforge-app --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess TWILIO_AUTH_TOKEN --backend lightforge-app --project lightforge-2cf3b
```

Uncomment matching blocks in `apphosting.yaml`, set:

- `PORTAL_OTP_FROM_EMAIL` / `RESEND_FROM_EMAIL` (verified sender)
- `TWILIO_FROM_NUMBER` (for SMS)

### 2. Stripe secrets

```bash
firebase apphosting:secrets:set STRIPE_SECRET_KEY --project lightforge-2cf3b
firebase apphosting:secrets:set STRIPE_WEBHOOK_SECRET --project lightforge-2cf3b
firebase apphosting:secrets:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess STRIPE_SECRET_KEY --backend lightforge-app --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess STRIPE_WEBHOOK_SECRET --backend lightforge-app --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY --backend lightforge-app --project lightforge-2cf3b
```

Uncomment Stripe blocks in `apphosting.yaml`. Point Stripe webhook to:

`https://lightforge-app--lightforge-2cf3b.us-central1.hosted.app/api/billing/webhook`

Include `checkout.session.completed` and async payment events.

### 3. Data backfill

```bash
pnpm backfill:portal-ids --dry-run
pnpm backfill:portal-ids
# or one tenant:
pnpm backfill:portal-ids --tenant=<tenantId>
```

This fills missing `customerId` / `propertyId` from names. Prefer re-saving records in CRM afterward so dual-write stays current.

### 4. Soft launch

1. Keep Customer Portal **off** globally  
2. Enable for Yuletide (or one tenant) only  
3. Walk QR → home → service → proposal → OTP → pay  
4. Rotate link and confirm old sessions die  
5. Confirm no `debugCode` in production API responses

### 5. Ops

- Connect GitHub to App Hosting for automatic rollouts (`docs/DEPLOY.md`)
- Auth authorized domain already listed in deploy docs
- Watch portal audit events + Stripe webhook failures

## Explicitly not required for v1

- Full HOA community management
- Live GPS tracking
- Automated autopay charging schedule
- Native mobile apps
