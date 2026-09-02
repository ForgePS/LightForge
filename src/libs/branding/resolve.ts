import type { BrandingSettings } from '@libs/branding/types'

export function resolveLogoUrl(branding: BrandingSettings | null | undefined, isDark: boolean) {
  if (!branding) return null

  if (isDark) {
    return branding.logoDarkUrl || branding.logoUrl || null
  }

  return branding.logoUrl || null
}

export function resolveFaviconUrl(branding: BrandingSettings | null | undefined) {
  return branding?.faviconUrl || null
}
