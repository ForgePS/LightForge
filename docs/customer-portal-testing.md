# Customer Portal — Testing Foundation

**Status:** Started (spec §31)  
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
- Pure helpers extracted to `status-logic.ts`, `status-mappers.ts`, `authorization.ts`
- CI runs `pnpm test` before typecheck/build

## Still deferred

- Integration tests (grant exchange, webhook payment authority, cross-tenant isolation)
- End-to-end browser flows
- Accessibility / security automated suites
- Real SMS/email OTP provider tests

## Run locally

```bash
pnpm test
pnpm exec tsc --noEmit
```
