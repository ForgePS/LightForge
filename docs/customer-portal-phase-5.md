# Customer Portal — Phase 5 Messaging, Renewal & Multi-Property

**Status:** Implemented  
**Depends on:** Phase 1–4  
**Spec sections:** messaging, seasonal renewal, add-ons, multi-property

## What shipped

### Customer portal
- Messages list + thread replies (`messageThreads` + inbound/outbound messages)
- New message compose from `/portal/messages`
- Seasonal renewal request with keep-same / change notes, preferred period, optional L3 signed name
- Add-on requests (office review only — no silent scope/invoice changes)
- Multi-property switcher on Account when the tenant enables Multiple Properties

### Staff / data
- Threads land in `tenants/{id}/messageThreads` with `staffUnread`
- Renewal writes `rebookingRequests`
- Add-ons write `addOnRequests`
- Property switch updates `customerPortals.primaryPropertyId`

### Seed
- Anderson `MSG-2026-SEED1` thread
- Anderson Guest Cottage for property switching
- Anderson install job marked en route (used by Phase 6 arrival UI)

## Enablement

1. Settings → Customer Portal → enable Messages, Seasonal Renewal, Add-On Requests, Multiple Properties as needed
2. Customer edit → Enable Portal → open secure link
3. Re-seed demo data if testing Anderson multi-property / message thread

## Try it

1. Home → Messages → open seed thread or send a new message
2. Renew Service → keep same design → submit
3. Account → switch between Anderson Main Home and Guest Cottage
4. My Lighting → Request an Addition → submit add-on on Renewal page

## Notes

- Message list falls back to the flat `messages` collection when no threads exist
- Signed renewal / identity-sensitive actions still require Level 3 OTP
