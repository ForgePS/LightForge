import type { ChildrenType } from '@core/types'
import Providers from '@components/Providers'
import BrandingEffects from '@components/branding/BrandingEffects'
import PlatformShell from '@components/platform/PlatformShell'
import { requirePlatformAdmin } from '@libs/auth/guards'
import { getPlatformSettings } from '@libs/platform/admin'

const Layout = async (props: ChildrenType) => {
  const { children } = props
  const user = await requirePlatformAdmin()
  const settings = await getPlatformSettings()

  return (
    <Providers direction='ltr'>
      <BrandingEffects branding={settings.branding} />
      <PlatformShell user={user} branding={settings.branding} platformName={settings.platformName}>
        {children}
      </PlatformShell>
    </Providers>
  )
}

export default Layout
