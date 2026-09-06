# Customer Portal — Testing Foundation

**Status:** In progress (spec §31)  
**Depends on:** Phases 1–6

## What shipped

- Vitest (`pnpm test`) with path aliases
- Unit coverage for:
  - Token generation / hashing / comparison / short codes
  - Portal settings normalization
  - Seasonal status + primary action mapping
  - Invoice / service status mappers
  - Assurance level step-up expiry
  - Customer/property authorization matching
- Integration-style coverage for:
  - Grant exchange decisions (disabled portal, rotated token, expired grant)
  - Session validity (revoked / expired / idle / disabled)
  - Cross-customer invoice isolation + tenant id checks
  - Webhook payment authority (ignore non-portal purpose, pending unpaid, idempotent complete)
  - Browser return is never authoritative
- Pure helpers: `access-rules.ts`, `payment-rules.ts`, `status-logic.ts`, `status-mappers.ts`, `authorization.ts`
- Runtime paths (`session.exchangeGrantToken`, `hydrateSession`, `reconcilePortalCheckoutSession`, invoice visibility) call the shared rules
- CI runs `pnpm test` before typecheck/build

## Still deferred

- Firestore emulator / live API integration tests
- End-to-end browser flows
- Accessibility / security automated suites
- Real SMS/email OTP provider tests

## Run locally

```bash
pnpm test
pnpm exec tsc --noEmit
```
