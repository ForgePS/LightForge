# Customer Portal — Phase 0 Discovery and Mapping

**Status:** Complete  
**Date:** 2026-09-02  
**Spec:** [LIGHTFORGE_CUSTOMER_PORTAL_SPECIFICATION.md](./LIGHTFORGE_CUSTOMER_PORTAL_SPECIFICATION.md)  
**Codebase:** LightForge Next.js 16 + Firebase (`tenants/{tenantId}/{collection}`)

---

## 1. Summary

LightForge already has the operational CRM surface the portal must sit on: customers, properties, contacts, proposals, jobs, schedule, service issues, invoices, messages, mockups, and rebooking. Multi-tenant branding (logo + colors), staff session cookies, module feature flags, and Stripe for **platform SaaS billing** exist.

There is **no customer portal** yet. No public `/p/:shortCode` routes, portal grants/sessions, customer-visible flags, OTP/magic-link delivery, electronic signatures, media library, lighting-item catalog, or end-customer invoice payments.

Phase 1 can start on a portal foundation, but several model and integration gaps must be addressed before real customer data is exposed.

---

## 2. Architecture Fit

| Spec principle | Current platform | Fit |
|---|---|---|
| Shared platform records (no duplicate CRM) | Generic module CRUD under `tenants/{id}/{collection}` | Strong — portal should read/write these collections via dedicated serializers |
| Tenant isolation | Member-based Firestore rules + API tenant context | Strong for staff; portal needs separate principal + server-only access |
| Contractor branded | `BrandingSettings`: logo, logoDark, favicon, primaryColor, accentColor | Partial — needs portal name, support contacts, footer, terminology, custom domain |
| Feature flags per tenant | `settings/modules.enabled[]` | Reusable pattern; portal needs its own settings doc (spec §18) |
| Seasonal / context aware | Jobs (`install`/`service`/`takedown`), scheduleEvents, proposals, rebooking | Partial — no explicit Season entity; status must be derived |
| Secure tokenized access | Staff Firebase Auth + `__session` cookie | Pattern reusable; customer grants/sessions are new |

---

## 3. Entity Mapping (Spec → Existing)

Conceptual names from spec §21.6 mapped to LightForge today.

| Spec entity | Existing collection / location | Mapping notes |
|---|---|---|
| Tenant | `tenants/{id}` + `settings/general` | OK |
| Customer | `customers` | OK; lacks stable FK usage from related docs |
| Customer contact | `contacts` | Linked by `customerName` string only |
| Property | `properties` | Linked by `customerName` string only |
| Season | — | **Missing.** Derive from job year / scheduled dates for Phase 1–2; add Season later if needed |
| Opportunity | — | **Missing.** Proposal status covers early funnel for now |
| Proposal | `proposals` | Statuses: draft/sent/accepted/declined. Spec needs richer states + line items |
| Proposal line item | — | **Missing.** Amount is a single `amountCents` |
| Design / estimate | `mockups` | `assetUrl` text; no upload pipeline |
| Job | `jobs` | Types include `takedown` (Yuletide terminology already matches seed) |
| Appointment | `scheduleEvents` | Has date/startTime/crew; no arrival window fields |
| Installation | `jobs` where `type=install` | Same collection |
| Lighting item | — | **Missing.** Closest: `customerStorage` (physical storage qty), not package scope |
| Photo / file | — | **Missing.** Only branding Storage + mockup URL strings |
| Service request | `serviceIssues` | Map portal submissions here; expand problem type/location fields |
| Work order | `jobs` / `serviceIssues` | No separate WO entity |
| Invoice | `invoices` | Staff CRUD; statuses draft/sent/paid/void |
| Payment | — | **Missing** as customer payment records |
| Agreement / document | — | **Missing** |
| Message thread | `messages` | Outbound log only; not threaded bi-directional |
| Notification | — | **Missing** delivery service |
| Audit event | — | **Missing** append-only audit store |
| Customer portal | — | **New** per spec §21.1–21.4 |
| Portal grant / session / verification | — | **New** |

### Relationship model gap (blocking)

Related records use **denormalized display names** (`customerName`, `propertyName`, `jobTitle`), not document IDs.

Portal authorization requires:

```text
session.customerId → property ownership → invoice/proposal/job ownership
```

**Recommendation before exposing real data:** add optional `customerId` / `propertyId` / `jobId` fields on related collections and dual-write them from staff UI/API. Keep display names for list UX. Portal queries must use IDs, never names.

---

## 4. Route and Service Mapping

### Staff / platform (reuse, do not redesign)

| Area | Paths |
|---|---|
| Module CRUD UI | `/(dashboard)/{module}` via `ModulePage` |
| Module API | `/api/tenants/current/[collection]` |
| Branding | `/api/tenants/current/branding`, Settings UI |
| Platform SaaS Stripe | `/api/billing/checkout`, `/portal`, `/webhook` |
| Auth | `/api/auth/session`, `/logout`; middleware cookie gate |

### Spec routes to add (public customer surface)

| Spec route | Status |
|---|---|
| `/p/:shortCode` | Missing — middleware currently redirects unauthenticated page traffic to `/login` |
| `/p/:shortCode/verify` | Missing |
| `/portal/*` (home, lighting, photos, schedule, service, …) | Missing |
| `/api/customer-portal/*` | Missing |
| `/api/admin/customer-portals/*` | Missing |
| Tenant custom domain → portal | Missing |

**Middleware change required:** treat `/p`, `/portal`, and `/api/customer-portal` as public prefixes (auth via portal session cookie, not staff `__session`).

---

## 5. Integration Status

| Integration | Spec need | Current state | Phase |
|---|---|---|---|
| Stripe | Customer invoice PaymentIntents / Connect | Platform subscription only (`src/libs/billing/stripe.ts`) | Phase 4 — needs tenant payment config |
| Email | Magic link, OTP, confirmations | Messages module is a log; no provider | Phase 1 foundation needs at least one channel |
| SMS | OTP, link delivery | Same | Phase 1 or Phase 2 |
| File storage | Photos, documents, uploads | Branding assets in GCS only | Phase 2 |
| E-signature | Agreement / proposal sign | None | Phase 3 |
| QR generation | Short URL QR PNG/SVG | None | Phase 1 |
| Notifications / consent | Preference-aware send | Automations are stubs | Phase 2+ |

---

## 6. Branding and Yuletide Reference

**Exists today** (`src/libs/branding/types.ts`):

- `logoUrl`, `logoDarkUrl`, `faviconUrl`
- `primaryColor`, `accentColor`
- Tenant `companyName`, `supportEmail`, `timezone` in `settings/general`

**Needed for portal §18:**

- Portal display name
- Secondary / text color overrides
- Support phone, website
- Portal welcome message, footer text
- Terms / privacy URLs
- Custom portal domain
- `Powered by LightForge` entitlement
- Terminology map (e.g. removal → “takedown”, renewal → “Rebook for Next Season”)

**Yuletide:** seeded tenant slug `yuletide-lighting-co` (`scripts/seed-tenants.ts`). Same demo module seed as LightForge Demo. No Yuletide-specific branding seed yet. Spec entry: `https://yuletidelightingco.com/portal`.

---

## 7. Field Visibility Matrix

Default rule from spec §24: **staff-only unless explicitly customer-visible.** Historical records must not auto-expose.

### 7.1 Customers

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `name` (greeting first name / display) | Yes | L1 | Prefer contact first name when available |
| `type` | No | — | Internal segmentation |
| `email` | Masked / after L2 | L2 | Full value only after identity confirm |
| `phone` | Masked / after L2 | L2 | Same |
| `status` | Derived seasonal status only | L1 | Do not show CRM `lead`/`inactive` raw |
| `tags` | No | — | Staff only |
| `notes` | No | — | Staff only |

### 7.2 Properties

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `name` | Yes | L1 | Nickname OK |
| `address`, `city`, `state`, `zip` | Yes | L1 | Service address |
| `customerName` | No (redundant) | — | Use authorized greeting |
| `serviceNotes` | Split | L1 / review | Customer-approved access instructions only; treat current field as staff-only until split |

### 7.3 Contacts

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| Own contact name/email/phone | Yes | L2 | Account self-view |
| Other authorized contacts | Limited | L2–L3 | Role-scoped; changes may need L3 |
| `role` | Yes (label) | L2 | Billing / operations / etc. later |

### 7.4 Mockups (design previews)

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `title` | When status shared/approved | L1 | Draft never |
| `assetUrl` | Same | L1 | Need signed URLs later |
| `status` | Mapped | L1 | Hide draft |
| `notes` | No by default | — | Add `customerSummary` if needed |
| `propertyName` | Yes | L1 | |

### 7.5 Proposals

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `title`, `amountCents` | When sent+ | L1 view; L3 accept | Draft never |
| `status` | Mapped customer states | L1 | Extend statuses for portal |
| `notes` | No | — | Staff only |
| Line items / taxes / terms | **Missing model** | L1–L3 | Required for Phase 3 |

### 7.6 Jobs

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `title` | Soft / type label | L1 | Prefer “Installation” over internal titles |
| `type` | Yes (mapped) | L1 | install / service / takedown |
| `status` | Mapped customer status | L1 | |
| `scheduledDate` | Yes | L1 | Add arrival window fields |
| `crewNotes` | **Never** | — | Staff only |
| `propertyName` | Yes | L1 | |

### 7.7 Schedule events

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `title`, `date`, `startTime` | Yes | L1 | Add end/window |
| `jobTitle` | Soft label | L1 | |
| `crew` | First name / company photo only if enabled | L1 | Never full roster / phones |
| `notes` | Customer-facing prep only | L1 | Current `notes` = staff-only until split |

### 7.8 Routes

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| All fields | **Never** | — | Route order, other stops, driver — staff only |

### 7.9 Service issues

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `title` | Yes (customer-authored or summary) | L1 | |
| `status` | Mapped (Submitted → Completed) | L1 | Hide internal triage |
| `priority` | **Never** | — | Internal |
| `notes` | Split | L1 | Customer description + customer-facing resolution only |
| Problem type / location / photos | **Extend model** | L1 | Portal form fields |

### 7.10 Invoices

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| `number`, `amountCents`, `dueDate`, `status` | Yes when not draft | L2 | Force L2 if tenant policy |
| `notes` | No | — | Staff only |
| Payment method details | Never | — | Processor only |
| Draft / void internals | Draft never; void carefully | L2 | |

### 7.11 Messages

| Field | Customer visible | Assurance | Notes |
|---|---|---|---|
| Customer thread body | Yes | L1–L2 | Needs thread model |
| Staff-only notes / mentions | **Never** | — | Separate |
| Outbound marketing log | Not as chat | — | |

### 7.12 Customer storage / inventory / time / project prep / automations / signs

| Module | Portal | Notes |
|---|---|---|
| `customerStorage` | Summary only if enabled | Location/SKU staff-only; “lights in storage” status OK |
| `inventoryItems` | Never | |
| `timeEntries` | Never | |
| `projectPrep` | Never | |
| `automations` | Never | |
| `signTrackers` | Never | |
| `commercialAccounts` | Account manager views later | Phase 5–6 |
| `rebookingRequests` | Renewal flow writes here or seasons | Phase 5 |
| `reviews` | Phase 6 | |

### 7.13 New portal collections (all tenant-scoped)

| Collection | Customer access | Staff access |
|---|---|---|
| `customerPortals` | Indirect via session | Admin panel |
| `customerPortalGrants` | Token exchange only (hashed at rest) | Rotate / revoke |
| `customerPortalSessions` | Own session cookie | Revoke / audit |
| `customerPortalVerifications` | Own OTP flow | Support audit |
| `customerPortalFeatureSettings` | Read effective flags | Tenant settings |

---

## 8. Status Mapping (Operational → Customer)

### Jobs / schedule

| Internal | Customer-facing |
|---|---|
| proposal draft | (hidden) |
| proposal sent | Proposal ready / Review proposal |
| job `scheduled` + install | Installation scheduled |
| job `in_progress` | Installation underway |
| job `complete` | Lights installed |
| service issue open | Track request / Request service |
| job `takedown` scheduled | Removal / takedown scheduled |
| storage stage | Lights safely stored |
| rebooking open | Renew / Rebook |

### Service issues

| Internal | Customer |
|---|---|
| open | Submitted / Received |
| in_progress | In Progress / Scheduled (when appointment exists) |
| resolved | Completed |

---

## 9. Gaps Ranked for Build Order

### Must resolve for Phase 1 (foundation)

1. Public middleware allowlist for `/p`, `/portal`, `/api/customer-portal`
2. New portal collections (portals, grants, sessions) under tenant
3. Short code + hashed grant exchange + HTTP-only portal session cookie
4. QR generation for short URL
5. Level 1 home DTO from customer + property + derived status
6. Staff portal panel on customer record (enable, copy link, QR, rotate)
7. Audit events for portal enable / exchange / revoke
8. Tenant portal feature settings (default off)
9. Begin adding `customerId` / `propertyId` on core related docs

### Must resolve for Phase 2 (core service)

10. Email and/or SMS provider for confirmations (OTP can land Phase 3)
11. Media collection + signed upload/download
12. Lighting package representation (new fields or `lightingItems` collection)
13. Service issue form fields + customer status serializer
14. Split customer-visible vs staff notes on property/schedule/jobs

### Later phases

15. Proposal line items, signature, Level 3 OTP (Phase 3)
16. Tenant Stripe payments for invoices (Phase 4)
17. Message threads + renewal (Phase 5)

---

## 10. Recommended Technical Placement

Keep portal inside the Next.js app (not a separate CRM):

```text
src/app/(portal)/          # customer UI layouts (no Vuexy admin chrome)
src/app/p/[shortCode]/     # grant exchange entry
src/app/api/customer-portal/
src/app/api/admin/customer-portals/
src/libs/customer-portal/   # tokens, serializers, assurance, status derivation
```

Staff management lives on existing customer module UI / a portal settings section under Settings — do not fork customer records.

Firestore layout (aligned with existing tenancy):

```text
tenants/{tenantId}/customerPortals/{portalId}
tenants/{tenantId}/customerPortalGrants/{grantId}
tenants/{tenantId}/customerPortalSessions/{sessionId}
tenants/{tenantId}/customerPortalVerifications/{verificationId}
tenants/{tenantId}/settings/customerPortal   # feature + access settings
```

Optional global short-code index (server-only) if lookup by short code across tenants is required without scanning:

```text
portalShortCodes/{shortCode} → { tenantId, portalId }
```

All portal reads/writes go through Admin SDK with explicit authorization checks (do not open Firestore rules to anonymous clients).

---

## 11. Phase 0 Exit Checklist

- [x] Spec copied into `docs/`
- [x] Existing modules, routes, and integrations inventoried
- [x] Spec entities mapped to collections
- [x] Staff-only vs customer-visible field matrix drafted
- [x] Payment / SMS / email / storage / signature gaps recorded
- [x] Yuletide reference tenant identified
- [x] Phase 1 blockers and placement recommendations written

**Ready for Phase 1** when product agrees:

1. Portal collections + short-code index approach above  
2. Dual-write of `customerId` / `propertyId` as a parallel hardening track  
3. Notification provider choice for magic link / OTP (can stub in Phase 1 with logged “outbox” if needed for local demo)

---

## 12. Suggested Next Step

Implement **Phase 1: Portal Foundation** behind a tenant feature flag defaulting to off:

- `settings/customerPortal` config
- Portal record + short code + grant + session
- `/p/:shortCode` exchange
- Level 1 branded home (status + primary action stub)
- Staff Customer Portal panel (enable, QR, copy, rotate, disable)
- Audit foundation

Yuletide Lighting Co remains the first tenant to enable after internal preview.
