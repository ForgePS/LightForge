import PortalLightingClient from '@components/customer-portal/PortalLightingClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalLighting } from '@libs/customer-portal/lighting'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalLightingPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalLightingClient lighting={null} error='Your portal session has expired. Open your secure link again.' />
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.myLighting) {
    return <PortalLightingClient lighting={null} error='My Lighting is not enabled for this portal.' />
  }

  try {
    const lighting = await getPortalLighting(session)

    return <PortalLightingClient lighting={lighting} />
  } catch {
    return <PortalLightingClient lighting={null} error='Unable to load your lighting package.' />
  }
}
