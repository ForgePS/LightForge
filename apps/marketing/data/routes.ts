export type MarketingRoute = {
  path: string
  changefreq?: 'weekly' | 'monthly' | 'yearly'
  priority?: number
}

/** Public marketing routes for sitemap generation. */
export const marketingRoutes: MarketingRoute[] = [
  { path: '/', changefreq: 'weekly', priority: 1 },
  { path: '/features', changefreq: 'monthly', priority: 0.9 },
  { path: '/crm', changefreq: 'monthly', priority: 0.85 },
  { path: '/estimating', changefreq: 'monthly', priority: 0.85 },
  { path: '/proposals', changefreq: 'monthly', priority: 0.85 },
  { path: '/scheduling', changefreq: 'monthly', priority: 0.85 },
  { path: '/field', changefreq: 'monthly', priority: 0.85 },
  { path: '/inventory', changefreq: 'monthly', priority: 0.85 },
  { path: '/customer-portal', changefreq: 'monthly', priority: 0.85 },
  { path: '/payments', changefreq: 'monthly', priority: 0.85 },
  { path: '/service', changefreq: 'monthly', priority: 0.8 },
  { path: '/takedowns', changefreq: 'monthly', priority: 0.8 },
  { path: '/renewals', changefreq: 'monthly', priority: 0.8 },
  { path: '/analytics', changefreq: 'monthly', priority: 0.8 },
  { path: '/marketing', changefreq: 'monthly', priority: 0.75 },
  { path: '/integrations', changefreq: 'monthly', priority: 0.75 },
  { path: '/pricing', changefreq: 'monthly', priority: 0.9 },
  { path: '/solutions', changefreq: 'monthly', priority: 0.85 },
  { path: '/solutions/holiday-lighting', changefreq: 'monthly', priority: 0.8 },
  { path: '/solutions/event-lighting', changefreq: 'monthly', priority: 0.8 },
  { path: '/solutions/permanent-lighting', changefreq: 'monthly', priority: 0.8 },
  { path: '/resources', changefreq: 'monthly', priority: 0.7 },
  { path: '/help', changefreq: 'monthly', priority: 0.7 },
  { path: '/about', changefreq: 'monthly', priority: 0.65 },
  { path: '/contact', changefreq: 'monthly', priority: 0.75 },
  { path: '/demo', changefreq: 'monthly', priority: 0.9 },
  { path: '/security', changefreq: 'yearly', priority: 0.6 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.5 },
  { path: '/terms', changefreq: 'yearly', priority: 0.5 }
]
