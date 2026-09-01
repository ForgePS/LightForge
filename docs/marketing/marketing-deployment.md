# Marketing Deployment

Production marketing domain: `https://www.lightforgecrm.com`  
Platform app domain: `https://app.lightforgecrm.com`

The marketing site is **independently buildable and deployable** from the LightForge monorepo. Platform deploy (Firebase App Hosting) is unchanged.

## Architecture

| Layer | Target |
| --- | --- |
| Static pages | Amazon S3 + CloudFront |
| Forms (`POST /api/demo`, `POST /api/contact`) | Requires serverless origin (see below) |
| Platform SaaS | Firebase App Hosting at repo root — **do not modify for marketing** |

Marketing changes trigger CI only when files under the marketing path filter change (see `.github/workflows/marketing.yml`).

## Build outputs

| Command | Output | Use case |
| --- | --- | --- |
| `pnpm build:marketing` | `.output/public` + Nitro server | Local preview, Node/Lambda hosting |
| `pnpm build:marketing:static` | `.output/public` only (`NITRO_PRESET=static`) | S3 + CloudFront static hosting |

Both commands prerender all routes in `apps/marketing/data/routes.ts` plus `/sitemap.xml` and `/robots.txt`.

## Local commands

```bash
pnpm install
pnpm dev:marketing          # http://localhost:3001
pnpm typecheck:marketing
pnpm build:marketing:static
pnpm validate:marketing     # verifies prerendered HTML/XML exists
```

## Production environment variables

Set at build time (public, safe to embed):

```env
NUXT_PUBLIC_SITE_URL=https://www.lightforgecrm.com
NUXT_PUBLIC_APP_URL=https://app.lightforgecrm.com
NUXT_PUBLIC_COOKIE_CONSENT_ENABLED=false
```

Deploy-time variables (CI secrets / local shell):

```env
MARKETING_S3_BUCKET=your-marketing-bucket
MARKETING_CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

Optional AWS CLI credentials for manual deploy:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
```

Marketing must **never** receive SaaS secrets (Firebase admin, DB, Stripe private keys, session secrets).

## Manual deploy (after AWS resources exist)

1. Build the static site:

```bash
pnpm build:marketing:static
pnpm validate:marketing
```

2. Dry-run sync:

```bash
MARKETING_S3_BUCKET=your-bucket node apps/marketing/scripts/deploy-static.mjs --dry-run
```

3. Deploy:

```bash
MARKETING_S3_BUCKET=your-bucket \
MARKETING_CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id \
pnpm deploy:marketing
```

Or run the **Marketing → deploy** job manually in GitHub Actions (`workflow_dispatch`) after configuring repository secrets and variables.

### Required GitHub configuration

**Secrets**

- `MARKETING_AWS_ACCESS_KEY_ID`
- `MARKETING_AWS_SECRET_ACCESS_KEY`

**Variables**

- `MARKETING_S3_BUCKET`
- `MARKETING_CLOUDFRONT_DISTRIBUTION_ID`
- `MARKETING_AWS_REGION` (optional, default `us-east-1`)

**Environment**

- `marketing-production` (optional; used by deploy job)

## AWS setup (one-time, outside this repo)

Do **not** provision or replace existing platform CloudFront distributions. Create **separate** marketing resources:

1. **S3 bucket** — private; origin for CloudFront (block public access)
2. **ACM certificate** — `www.lightforgecrm.com` (and optional apex redirect)
3. **CloudFront distribution** — origin = S3; default root `index.html`
4. **Route 53** — `www.lightforgecrm.com` → CloudFront; optional apex → `www`
5. **CloudFront error responses** — map 403/404 to `/404.html` or prerendered error page if needed

### CloudFront path behavior

| Path | Origin | Notes |
| --- | --- | --- |
| `/*` (default) | S3 static | Prerendered HTML, assets, sitemap, robots |
| `/api/*` | Lambda/API Gateway (future) | Demo + contact forms |

Until `/api/*` is wired to a serverless backend, static-only deploy serves all pages but **form submissions will not reach Nitro server routes**. Options:

- Deploy Nitro API routes to AWS Lambda (separate sprint)
- Point forms at an approved external endpoint via env (future)
- Keep forms as validation-only stubs until backend is approved

## CI workflow

File: `.github/workflows/marketing.yml`

**Triggers (path-filtered):**

- `apps/marketing/**`
- `packages/branding/**`
- `packages/ui/**`
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`

**Jobs:**

1. **quality** — typecheck, static build, route validation; uploads artifact on push
2. **deploy** — manual `workflow_dispatch` only; syncs S3 + invalidates CloudFront

Platform CI (`.github/workflows/ci.yml`) remains separate and unchanged.

## Quality gate (S10)

Before declaring marketing deploy-ready:

```bash
pnpm lint:marketing        # placeholder until ESLint configured
pnpm typecheck:marketing   # 0 TypeScript errors
pnpm build:marketing:static
pnpm validate:marketing    # 0 missing prerendered routes
```

Required:

- 0 build errors
- 0 TypeScript errors
- 0 missing prerendered routes

## Domains

| Host | Application |
| --- | --- |
| `www.lightforgecrm.com` | Marketing (this app) |
| `app.lightforgecrm.com` | LightForge SaaS platform |
| `lightforgecrm.com` | Optional redirect → `www` |

Login CTA in the marketing navbar links to `NUXT_PUBLIC_APP_URL`. No shared auth cookies between apps.

## Related docs

- [`marketing-architecture.md`](marketing-architecture.md)
- [`marketing-routes.md`](marketing-routes.md)
- [`marketing-seo.md`](marketing-seo.md)
- Platform deploy: [`../DEPLOY.md`](../DEPLOY.md)
