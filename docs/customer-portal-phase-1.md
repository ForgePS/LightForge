# Customer Portal — Phase 1 Foundation

**Status:** Implemented (behind tenant flag, default off)  
**Spec:** [LIGHTFORGE_CUSTOMER_PORTAL_SPECIFICATION.md](./LIGHTFORGE_CUSTOMER_PORTAL_SPECIFICATION.md)  
**Discovery:** [customer-portal-phase-0-discovery.md](./customer-portal-phase-0-discovery.md)

## What shipped

- Tenant settings: **Settings → Customer Portal** (`tenants/{id}/settings/customerPortal`), default `enabled: false`
- Portal records, hashed grants, sessions, short-code index, session index, audit events
- Secure link format: `/p/{shortCode}?g={grantToken}`
- Grant exchange → HTTP-only portal session cookie → `/portal/home`
- Level 1 home: branding, greeting, derived status, primary action, balance card, quick actions, activity
- Staff panel on customer edit dialog: enable, copy links, QR, regenerate, revoke sessions, disable
- QR PNG/SVG download via admin API
- Public middleware allowlist for `/p`, `/portal`, `/api/customer-portal`
- Placeholder routes for later phases

## How to try it

1. Sign in as a tenant admin (e.g. Yuletide).
2. Open **Settings → Customer Portal** and enable the workspace flag. Optionally set renewal label to `Rebook for Next Season` and removal label to `Takedown`.
3. Open **Customers**, edit a customer, **Enable Portal**.
4. Copy the secure link (shown once) or scan/download the QR.
5. Open the link in a private/mobile browser window → Level 1 home.

## Collections

```text
tenants/{tenantId}/customerPortals
tenants/{tenantId}/customerPortalGrants
tenants/{tenantId}/customerPortalSessions
tenants/{tenantId}/portalAuditEvents
tenants/{tenantId}/settings/customerPortal
portalShortCodes/{shortCode}
portalSessionIndex/{sessionTokenHash}
```

## Not in Phase 1

- Level 2 / Level 3 verification, magic-link email entry
- My Lighting, photos, service forms, proposals, payments, messaging, renewal
- `customerId` dual-write on related records (still name-based joins for home derivation)
- SMS / email delivery of portal links

## Env

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORTAL_SESSION_COOKIE_NAME=__lf_portal_session
```
