import type { ChildrenType } from '@core/types'
import Providers from '@components/Providers'
import PlatformShell from '@components/platform/PlatformShell'
import { requirePlatformAdmin } from '@libs/auth/guards'

const Layout = async (props: ChildrenType) => {
  const { children } = props
  const user = await requirePlatformAdmin()

  return (
    <Providers direction='ltr'>
      <PlatformShell user={user}>{children}</PlatformShell>
    </Providers>
  )
}

export default Layout
