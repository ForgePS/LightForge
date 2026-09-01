# LightForge

Multi-tenant SaaS for lighting businesses — Vuexy (Next.js 16 + MUI), Firebase Auth/Firestore (`lightforge-2cf3b`, database `lightforge`), platform admin, and full product modules.

## Quick start

```bash
pnpm install
pnpm seed
pnpm firebase:rules
pnpm dev
```

Open http://localhost:3000 → redirects to `/dashboard` after login.

### Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Platform admin | `admin@lightforge.app` | `PlatformAdmin!2026` |
| Yuletide Lighting Co | `admin@yuletide.local` | `YuletideAdmin!2026` |
| LightForge Demo | `demo@lightforge.app` | `DemoAdmin!2026` |

## Product modules

- **Dashboard** — KPIs (jobs, proposals, invoices, schedule, issues)
- **Sales & Customers** — Customers, Properties, Mockups, Contacts, Proposals, Commercial Accounts, Rebooking
- **Operations** — Jobs, Project Prep, Schedule, Routes, Service Issues, Time Clock
- **Inventory & Storage** — Customer Storage, Inventory
- **Finance** — Invoices
- **Marketing** — Messages, Reviews & Referrals, Sign Tracker
- **Administration** — Automation, Reports, Settings (team invite + billing)

## Platform admin

`/platform` — tenants, subscriptions, plans, member invite, archive.

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md).

**App Hosting URL:** https://lightforge-app--lightforge-2cf3b.us-central1.hosted.app

```bash
# After GitHub is connected to the lightforge-app backend:
firebase apphosting:rollouts:create lightforge-app --git-branch main --project lightforge-2cf3b
```

## Stripe (optional)

Set in `.env.local`:

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_STARTER_MONTHLY=
...
```

Without Stripe keys, **Keep software** / platform subscription edits still activate tenants. Checkout/Portal return a friendly message until configured. Webhook: `POST /api/billing/webhook`.

## Tenancy

- Register → new **trial** tenant cloned from LightForge Demo template (full module seed)
- Convert trial → active (updates subscription to paid plan)
- Suspended / canceled / paused tenants block writes; Settings remains available
