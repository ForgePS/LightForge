import { marketingRoutes } from '~/data/routes'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = (config.public.siteUrl as string).replace(/\/+$/, '')
  const lastmod = new Date().toISOString().slice(0, 10)

  const urls = marketingRoutes
    .map(route => {
      const loc = `${siteUrl}${route.path === '/' ? '' : route.path}`
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq ?? 'monthly'}</changefreq>
    <priority>${route.priority ?? 0.5}</priority>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
