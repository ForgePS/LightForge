'use client'

import { useEffect } from 'react'
import { useColorScheme } from '@mui/material/styles'

import { useSettings } from '@core/hooks/useSettings'
import type { BrandingSettings } from '@libs/branding/types'
import { resolveFaviconUrl } from '@libs/branding/resolve'

function setFavicon(href: string | null) {
  if (typeof document === 'undefined') return

  const existing = document.querySelector<HTMLLinkElement>("link[rel*='icon']")

  if (!href) {
    if (existing) existing.href = '/favicon.ico'

    return
  }

  if (existing) {
    existing.href = href
    existing.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png'

    return
  }

  const link = document.createElement('link')

  link.rel = 'icon'
  link.href = href
  link.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  document.head.appendChild(link)
}

export default function BrandingEffects({ branding }: { branding?: BrandingSettings | null }) {
  const { updatePageSettings } = useSettings()
  const { mode } = useColorScheme()

  useEffect(() => {
    setFavicon(resolveFaviconUrl(branding))
  }, [branding?.faviconUrl])

  useEffect(() => {
    if (!branding?.primaryColor) return

    return updatePageSettings({ primaryColor: branding.primaryColor })
  }, [branding?.primaryColor, updatePageSettings, mode])

  return null
}
