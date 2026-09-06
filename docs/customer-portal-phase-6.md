# Customer Portal — Phase 6 Enhancements & Polish

**Status:** Implemented  
**Depends on:** Phase 1–5  
**Spec sections:** referrals, reviews, arrival, weather, autopay / saved methods, commercial/HOA

## What shipped

### Customer portal Account (`/portal/account`)
- Reviews (1–5 stars + notes) when Reviews toggle is on
- Refer a friend when Referrals toggle is on
- Autopay consent / revoke (Level 3) — preference on the customer record
- **Saved payment methods** via Stripe Checkout `mode: setup` (Level 3); webhook purpose `customer_portal_setup`
- Weather notices and technician en-route cards when present on jobs
- Property switcher (Phase 5) lives here

### Home / commercial
- Commercial/HOA greeting uses the organization name
- Multi-property switcher on home when Multiple Properties is enabled

### Schedule
- Weather notices on appointments
- `weather_delay` status mapped for customers
- Technician en route + crew first name when **Technician Arrival Status** is enabled

### Staff CRM
- Module create/update dual-writes `customerId` / `propertyId` from name fields when resolvable

### Settings
- Toggles: Referrals, Reviews, Technician Arrival Status, Saved Payment Methods, Autopay Consent

### Seed
- Anderson install: en route + weather
- Anderson mid-season: weather delay
- Anderson Guest Cottage + Maple Grove Entrances for multi-property
- Sample referral invite

## Enablement

1. Settings → Customer Portal → enable the Phase 6 features you want live
2. Configure Stripe for saved cards / invoice pay
3. Re-seed if you need the demo jobs and properties

## Try it

1. Account → Add card → complete Stripe Setup Checkout → confirm brand/last4 shown
2. Enable Autopay after a card is saved
3. Schedule → confirm weather delay / en-route messaging
4. Maple Grove HOA or Anderson → switch properties from Home

## Notes

- Autopay records consent only; charging open invoices on a schedule is a later ops job
- Full HOA community management remains a non-goal for the initial release
- Dual-write is best-effort by name match; prefer setting IDs explicitly when known
