# Customer Portal — Phase 3 Proposals & Documents

**Status:** Implemented  
**Depends on:** Phase 1–2  
**Spec sections:** §4.3 Level 3, §11, §13

## What shipped

### Level 3 verification
- `POST /api/customer-portal/verification/send`
- `POST /api/customer-portal/verification/confirm`
- Hashed OTP, attempt limits, resend cooldown, session token rotation on step-up
- 15-minute step-up window (`assuranceLevelExpiresAt`)
- Dev-only `debugCode` when `NODE_ENV=development`
- Delivery logged to `messages` without storing the raw code

### Proposals
- List + detail with public numbers (`PROP-YYYY-#####`)
- Line items grouped by service area, optional add-ons
- View marks `sent` → `viewed`
- Change request (does not edit pricing)
- Decline
- Accept & sign requires Level 3 OTP, captures signer/IP/UA, content hash
- Creates customer-visible signed `documents` record
- Staff notes never returned

### Documents
- Customer document center (`/portal/documents`)
- Sensitive categories force Level 3 before open
- Electronic sign for pending documents
- Staff CRM module: **Documents**

### Seed
- Maple Grove proposal ready for portal accept/sign flow
- Anderson signed agreement + Maple Grove pending authorization
- Staff-only document excluded from portal

## Try it

1. Re-seed (or create a `sent` proposal with `publicNumber` + `lineItems`).
2. Open customer portal → **Proposals** → Maple Grove proposal.
3. Request a code (dev shows debug code), verify, accept & sign.
4. Confirm proposal status updates and a signed document appears under Documents / staff CRM.

## Still deferred

- Real SMS/email OTP provider
- Deposit payment after acceptance (Phase 4)
- Full legal e-sign certification / jurisdiction review
