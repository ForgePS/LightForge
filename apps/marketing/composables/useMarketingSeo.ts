export type MarketingSeoOptions = {
  title: string
  description: string
  path?: string
  ogImage?: string
  ogTitle?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

function normalizePath(path: string) {
  if (path === '/') return '/'
  return path.replace(/\/+$/, '') || '/'
}

export function useMarketingSeo(options: MarketingSeoOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = (config.public.siteUrl as string).replace(/\/+$/, '')
  const path = normalizePath(options.path ?? route.path)
  const canonical = `${siteUrl}${path === '/' ? '' : path}`
  const ogImage = options.ogImage ?? `${siteUrl}/og-image.svg`
  const pageTitle = options.title
  const ogTitle = options.ogTitle ?? `${pageTitle} | LightForge`

  useSeoMeta({
    title: pageTitle,
    description: options.description,
    ogTitle,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: canonical,
    ogImage,
    ogSiteName: 'LightForge',
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: options.description,
    twitterImage: ogImage,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow'
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    script: (() => {
      if (!options.jsonLd) return []
      const schemas = Array.isArray(options.jsonLd) ? options.jsonLd : [options.jsonLd]
      return schemas.map(schema => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema)
      }))
    })()
  })
}

export function buildOrganizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LightForge',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    description: 'The operating platform for professional lighting companies.',
    sameAs: []
  }
}

export function buildWebSiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LightForge',
    url: siteUrl,
    description: 'Software for professional lighting companies — from lead to lights.'
  }
}

export function buildSoftwareApplicationSchema(siteUrl: string, appUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LightForge',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: appUrl,
    description:
      'Operating platform for professional holiday, event, and permanent lighting companies.',
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/pricing`,
      price: '0',
      priceCurrency: 'USD',
      description: 'Custom pricing — request pricing or book a demo.'
    }
  }
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}

export function buildBreadcrumbSchema(siteUrl: string, crumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path === '/' ? '' : crumb.path}`
    }))
  }
}
