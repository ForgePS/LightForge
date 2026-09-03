# Customer Portal — Phase 2 Core Service Experience

**Status:** Implemented (tenant portal flag still required)  
**Depends on:** Phase 1 foundation  
**Spec sections:** §7–10, §15

## What shipped

### Customer portal
- **My Lighting** — grouped customer-visible `lightingItems` (falls back to customer storage summary)
- **Photos** — customer-visible `photos` + shared/approved mockups; full-screen viewer
- **Schedule** — appointments from jobs/schedule events + season timeline
- **My Property** — customer-facing property fields only (`serviceNotes` never shown); low-risk preference updates; sensitive changes create `propertyChangeRequests`
- **Service requests** — create/track against existing `serviceIssues` with public numbers `SR-YYYY-#####`, status mapping, photo upload, safety acknowledgement
- Staff notification + customer confirmation written to `messages` log (delivery provider still Phase later)
- Mobile bottom nav: Home / My Lighting / Schedule / Service / Account

### Staff CRM
- New modules: **Lighting Package** (`/lighting-items`), **Photos** (`/photos`)
- Service Issues fields extended: `publicNumber`, `problemType`, `customerVisibleResolution`

### Seed
- Anderson lighting package, customer-visible photos, staff-only photo, richer service issues + property customer fields

## How to try

1. Re-seed or manually add `lightingItems` / `photos` for a customer (existing tenants with a pinned module list may need Lighting Package + Photos enabled in platform modules).
2. Enable Customer Portal in Settings and enable a customer portal.
3. Open the secure link → Home → My Lighting / Photos / Schedule / Service / Account.
4. Submit **Report a Lighting Issue** with an optional photo.
5. Confirm the ticket appears under Service Issues in the staff CRM.

## Visibility rules enforced

- Photos/lighting require `customerVisible !== false`
- Mockups only when `shared` or `approved`
- Property `serviceNotes` never returned
- Service internal `notes` / `priority` never returned to portal

## Still deferred

- Level 2/3 verification
- Real email/SMS providers
- Proposal / payment / messaging / renewal (Phases 3–5)
- Stable `customerId` dual-write everywhere (portal still joins on names + optional IDs)
