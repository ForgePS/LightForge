# Marketing Legal & Cookie Architecture

Legal copy is maintained separately from Vue UI components.

## Legal content location

```text
apps/marketing/content/legal/index.ts
```

Rendered by:

```text
apps/marketing/components/LegalDocumentView.vue
```

Pages:

- `/privacy` — Privacy Policy + Cookie Policy section (`#cookies-policy`)
- `/terms` — Terms of Service

**Important:** Current legal text is structural placeholder content for counsel review. Replace before production launch.

## Cookie consent architecture

- Component: `apps/marketing/components/CookieConsent.vue`
- Composable: `apps/marketing/composables/useCookieConsent.ts`
- Preference storage: `localStorage` key `lf-cookie-consent`

### Enable banner

Set in marketing env:

```text
NUXT_PUBLIC_COOKIE_CONSENT_ENABLED=true
```

Default is `false` — no banner unless optional analytics/advertising cookies are enabled and consent is required.

### Categories

- Essential (always on)
- Analytics (optional)
- Advertising (optional)

When analytics tools (GA, GTM, Plausible, PostHog) are added, wire them to respect stored consent before loading scripts.

## Resources & Help content

- Resources: `apps/marketing/data/resources.ts`
- Help center structure: `apps/marketing/data/help.ts`

Starter content only — expand as real articles are published.
