'use client'

import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'

import VuexyLogo from '@core/svg/Logo'
import type { BrandingSettings } from '@libs/branding/types'
import { resolveLogoUrl } from '@libs/branding/resolve'

type BrandedLogoMarkProps = {
  branding?: BrandingSettings | null
  className?: string
  height?: number
}

export default function BrandedLogoMark({ branding, className, height = 32 }: BrandedLogoMarkProps) {
  const { mode } = useColorScheme()
  const isDark = mode === 'dark'
  const logoUrl = resolveLogoUrl(branding, isDark)

  if (logoUrl) {
    return (
      <Box
        component='img'
        src={logoUrl}
        alt='Logo'
        className={className}
        sx={{
          height,
          width: 'auto',
          maxHeight: height,
          maxWidth: 120,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0
        }}
      />
    )
  }

  return <VuexyLogo className={className ?? 'text-2xl text-primary'} />
}
