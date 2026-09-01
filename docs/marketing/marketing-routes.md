# Marketing Routes

Production site: `https://www.lightforgecrm.com`  
App login target: `https://app.lightforgecrm.com`

## Core product pages (S4)

| Route | Page |
| --- | --- |
| `/` | Homepage |
| `/features` | Features overview |
| `/crm` | CRM & leads |
| `/estimating` | Estimating |
| `/proposals` | Proposals |
| `/scheduling` | Scheduling |
| `/field` | LightForge Field |
| `/inventory` | Inventory |
| `/customer-portal` | Customer portal |
| `/payments` | Payments |

## Operations pages (S5)

| Route | Page |
| --- | --- |
| `/service` | Service management |
| `/takedowns` | Takedowns |
| `/renewals` | Renewals |
| `/marketing` | Marketing |
| `/analytics` | Analytics |
| `/integrations` | Integrations (planned categories only) |

## Solutions pages (S6)

| Route | Page |
| --- | --- |
| `/solutions` | Solutions overview |
| `/solutions/holiday-lighting` | Holiday lighting |
| `/solutions/event-lighting` | Event lighting |
| `/solutions/permanent-lighting` | Permanent lighting |

## Commercial pages (S7)

| Route | Page |
| --- | --- |
| `/pricing` | Pricing (custom — no invented list prices) |
| `/demo` | Demo request form |
| `/contact` | Contact form |
| `/about` | About LightForge |
| `/security` | Security (no unverified certifications) |

## Resources & legal (S8)

| Route | Page |
| --- | --- |
| `/resources` | Resources hub |
| `/help` | Help center |
| `/privacy` | Privacy Policy + Cookie Policy |
| `/terms` | Terms of Service |

See also: `docs/marketing/marketing-legal-cookies.md`

Content sources:
- Solutions: `apps/marketing/data/solutions.ts` + `SolutionPageLayout.vue`
- Product pages: `apps/marketing/data/product-pages.ts` + `ProductPageLayout.vue`

## SEO & discovery (S9)

| Route / asset | Purpose |
| --- | --- |
| `/sitemap.xml` | Dynamic sitemap (all routes in `data/routes.ts`) |
| `/robots.txt` | Crawler rules + sitemap reference |
| `/og-image.svg` | Default Open Graph / Twitter image |

See also: `docs/marketing/marketing-seo.md`

SEO implementation:
- Composable: `apps/marketing/composables/useMarketingSeo.ts`
- FAQ data: `apps/marketing/data/faq.ts`
- Route list: `apps/marketing/data/routes.ts`
- Global JSON-LD: `apps/marketing/plugins/site-schema.ts`
