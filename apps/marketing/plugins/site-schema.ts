import {
  buildOrganizationSchema,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema
} from '~/composables/useMarketingSeo'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string).replace(/\/+$/, '')
  const appUrl = config.public.appUrl as string

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(buildOrganizationSchema(siteUrl))
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(buildWebSiteSchema(siteUrl))
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(buildSoftwareApplicationSchema(siteUrl, appUrl))
      }
    ]
  })
})
