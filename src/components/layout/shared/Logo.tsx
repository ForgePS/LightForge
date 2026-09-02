'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import styled from '@emotion/styled'
import { useColorScheme } from '@mui/material/styles'

import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'
import BrandedLogoMark from '@components/branding/BrandedLogoMark'
import { useOptionalTenant } from '@components/providers/TenantProvider'
import themeConfig from '@configs/themeConfig'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'
import type { BrandingSettings } from '@libs/branding/types'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
  isBreakpointReached?: VerticalNavContextProps['isBreakpointReached']
  color?: CSSProperties['color']
}

const LogoText = styled.span<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.375rem;
  line-height: 1.09091;
  font-weight: 700;
  letter-spacing: 0.25px;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 12px;'}
`

type LogoProps = {
  color?: CSSProperties['color']
  branding?: BrandingSettings | null
  displayName?: string
}

const Logo = ({ color, branding: brandingProp, displayName: displayNameProp }: LogoProps) => {
  const logoTextRef = useRef<HTMLSpanElement>(null)
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { mode } = useColorScheme()
  const tenantCtx = useOptionalTenant()
  const branding = brandingProp ?? tenantCtx?.tenant?.branding ?? null
  const displayName = displayNameProp ?? tenantCtx?.tenant?.name ?? themeConfig.templateName
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached, mode])

  return (
    <div className='flex items-center min-is-0'>
      <BrandedLogoMark branding={branding} height={28} />
      <LogoText
        color={color}
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        {displayName}
      </LogoText>
    </div>
  )
}

export default Logo
