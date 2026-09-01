# Marketing SEO (S9)

Production site: `https://www.lightforgecrm.com`

## Overview

The marketing app centralizes page-level SEO in `apps/marketing/composables/useMarketingSeo.ts`. Every public page should call `useMarketingSeo` instead of raw `useSeoMeta`.

## What `useMarketingSeo` sets

| Output | Source |
| --- | --- |
| `<title>` | `title` option |
| Meta description | `description` option |
| Canonical URL | `NUXT_PUBLIC_SITE_URL` + `path` (defaults to current route) |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:site_name` |
| Twitter Card | `summary_large_image` with matching title, description, image |
| Robots | `index, follow` (default) or `noindex, nofollow` when `noindex: true` |
| JSON-LD | Optional per-page schemas via `jsonLd` |

Default OG image: `/og-image.svg` (served from `apps/marketing/public/`).

## Global structured data

`apps/marketing/plugins/site-schema.ts` injects site-wide JSON-LD on every page:

- **Organization** — LightForge brand entity
- **WebSite** — marketing domain
- **SoftwareApplication** — app at `NUXT_PUBLIC_APP_URL`, pricing link to `/pricing`

## Per-page structured data

| Page / layout | Schema |
| --- | --- |
| Homepage (`pages/index.vue`) | FAQPage (from `data/faq.ts`) |
| Product pages (`ProductPageLayout.vue`) | BreadcrumbList |
| Solution pages (`SolutionPageLayout.vue`) | BreadcrumbList |
| Error page (`error.vue`) | none (`noindex: true`) |

Helper builders live in `useMarketingSeo.ts`: `buildFaqSchema`, `buildBreadcrumbSchema`, etc.

## Sitemap and robots

| Route | File | Notes |
| --- | --- | --- |
| `/sitemap.xml` | `server/routes/sitemap.xml.ts` | All routes from `data/routes.ts` |
| `/robots.txt` | `server/routes/robots.txt.ts` | Allows all crawlers; references sitemap URL |

## Environment variables

```env
NUXT_PUBLIC_SITE_URL=https://www.lightforgecrm.com
NUXT_PUBLIC_APP_URL=https://app.lightforgecrm.com
```

Local dev uses `.env.development` overrides. Canonical and sitemap URLs always derive from `siteUrl`.

## Prerendering

`nuxt.config.ts` prerenders all marketing routes listed in `data/routes.ts` for static output at build time.

## Accessibility (S9)

- Skip-to-main link in `layouts/default.vue` (`.lf-skip-link` in `assets/css/main.css`)
- FAQ accordion uses button triggers with `aria-expanded` (`FAQAccordion.vue`)

## Pages using `useMarketingSeo`

All public routes and shared layouts:

- Homepage, product pages, solution pages, commercial pages (pricing, demo, contact, about, security)
- Resources, help, privacy, terms
- Error page (noindex)

## Not in scope (future)

- Google Search Console verification meta tag
- Analytics / GTM (see `marketing-legal-cookies.md`)
- Blog or dynamic resource URLs in sitemap
- hreflang (single locale only)
