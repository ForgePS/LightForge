export type BrandingAssetKey = 'logo' | 'logoDark' | 'favicon'

export type BrandingSettings = {
  logoUrl?: string | null
  logoDarkUrl?: string | null
  faviconUrl?: string | null
  primaryColor?: string | null
  accentColor?: string | null
}

export const BRANDING_ASSET_FIELDS: Record<BrandingAssetKey, keyof BrandingSettings> = {
  logo: 'logoUrl',
  logoDark: 'logoDarkUrl',
  favicon: 'faviconUrl'
}

export const BRANDING_ASSET_LABELS: Record<BrandingAssetKey, { title: string; description: string }> = {
  logo: {
    title: 'Logo',
    description: 'Primary logo shown in navigation and customer-facing views. PNG, SVG, or JPG recommended.'
  },
  logoDark: {
    title: 'Dark mode logo',
    description: 'Optional logo variant for dark backgrounds. Leave empty to reuse the primary logo.'
  },
  favicon: {
    title: 'Favicon',
    description: 'Browser tab icon. Square PNG or ICO, ideally 32×32 or 64×64 pixels.'
  }
}

export const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  primaryColor: null,
  accentColor: null
}

export function normalizeBranding(value: unknown): BrandingSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_BRANDING }

  const data = value as Record<string, unknown>

  return {
    logoUrl: typeof data.logoUrl === 'string' ? data.logoUrl : null,
    logoDarkUrl: typeof data.logoDarkUrl === 'string' ? data.logoDarkUrl : null,
    faviconUrl: typeof data.faviconUrl === 'string' ? data.faviconUrl : null,
    primaryColor: typeof data.primaryColor === 'string' ? data.primaryColor : null,
    accentColor: typeof data.accentColor === 'string' ? data.accentColor : null
  }
}
