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

Content sources:
- Solutions: `apps/marketing/data/solutions.ts` + `SolutionPageLayout.vue`
- Product pages: `apps/marketing/data/product-pages.ts` + `ProductPageLayout.vue`
