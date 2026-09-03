import PortalHomeClient from '@components/customer-portal/PortalHomeClient'
import { buildPortalHomeDto } from '@libs/customer-portal/home'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalHomePage() {
  const ctx = await getPortalSessionFromCookie()

  if (!ctx) {
    return (
      <PortalHomeClient
        home={null}
        error='Your portal session has expired. Open your secure link or QR code again to continue.'
      />
    )
  }

  try {
    const home = await buildPortalHomeDto(ctx.tenantId, ctx.portal)

    return <PortalHomeClient home={home} />
  } catch {
    return (
      <PortalHomeClient
        home={null}
        error='This portal is temporarily unavailable. Please try again or contact your lighting company.'
      />
    )
  }
}
