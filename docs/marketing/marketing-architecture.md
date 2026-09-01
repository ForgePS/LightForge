# LightForge Marketing Architecture

## Overview

The marketing website is an independent Nuxt 3 application inside the LightForge monorepo.

| Surface | Path | Domain (target) |
| --- | --- | --- |
| Marketing | `apps/marketing` | `https://www.lightforgecrm.com` |
| SaaS platform | repository root (Next.js) | `https://app.lightforgecrm.com` |

Optional apex redirect: `https://lightforgecrm.com` → `https://www.lightforgecrm.com`.

The platform remains at the repository root. It is **not** moved to `apps/platform` in this sprint.

## Stack

- Nuxt 3 + Vue 3 + TypeScript
- Vuetify 3 (`vuetify-nuxt-module`)
- Shared brand tokens: `@lightforge/branding`
- Framework-agnostic UI contracts/CSS: `@lightforge/ui`

## Workspace

```text
pnpm-workspace.yaml
  - .                  # LightForge SaaS platform (Next.js)
  - apps/*             # marketing
  - packages/*         # branding, ui
```

## Local development

```bash
pnpm install
pnpm dev:marketing
```

Marketing runs on **http://localhost:3001** so it does not collide with the platform on port 3000.

Platform (unchanged):

```bash
pnpm dev
```

## Build

```bash
pnpm build:marketing
```

## Environment

Marketing-only env files live under `apps/marketing/`:

- `.env.example`
- `.env.development`
- `.env.production`

Public vars:

- `NUXT_PUBLIC_SITE_URL`
- `NUXT_PUBLIC_APP_URL` (Login CTA target; default `https://app.lightforgecrm.com`)

Marketing must never receive SaaS secrets (Firebase admin, DB, Stripe private keys, session secrets).

## Auth boundary

Login in the marketing navbar links to `NUXT_PUBLIC_APP_URL`. No marketing-side authentication or shared session cookies in this sprint.

## Forms

Server routes:

- `POST /api/demo` — validation, honeypot, rate limit, structured log
- `POST /api/contact` — validation, honeypot, rate limit, structured log

No CRM sync or email delivery is configured yet.

## Git remote

- Remote: `https://github.com/ForgePS/LightForge`
- Working branch: `feature/lightforge-marketing-site`

Remote was empty at S1 start; first push of platform + marketing will establish `main` history when approved.
