# Customer Portal — Phase 6 Enhancements & Polish

**Status:** Implemented  
**Depends on:** Phase 1–5  
**Spec sections:** referrals, reviews, arrival, weather, autopay / saved methods

## What shipped

### Customer portal Account (`/portal/account`)
- Reviews (1–5 stars + notes) when Reviews toggle is on
- Refer a friend when Referrals toggle is on
- Autopay consent / revoke (Level 3) — stores preference on the customer record only
- Weather notices and technician en-route cards when present on jobs
- Property switcher (Phase 5) lives here

### Schedule
- Weather notices on appointments
- Technician en route + crew first name when **Technician Arrival Status** is enabled

### Settings
- Toggles: Referrals, Reviews, Technician Arrival Status, Saved Payment Methods (stub), Autopay Consent

### Seed
- Anderson install: `en_route`, `crewFirstName`, `weatherNotice`, prep notes
- Sample `referralInvites` for Anderson

## Enablement

1. Settings → Customer Portal → enable the Phase 6 features you want live
2. Re-seed if you need the en-route / weather demo job

## Try it

1. Account → leave a review / refer a friend
2. Enable Autopay → complete OTP → confirm preference saved
3. Schedule → confirm Anderson install shows en-route + weather warning
4. Turn off Phase 6 toggles and confirm UI sections hide

## Notes

- Saved card capture remains a stub until Stripe payment-method setup is completed per tenant
- Autopay never charges without an open invoice + processor token; this phase only records consent
- Reviews written from the portal are customer-sourced and do not expose staff-only review notes
