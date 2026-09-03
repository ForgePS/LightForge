import PortalRenewalClient from '@components/customer-portal/PortalRenewalClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalRenewal } from '@libs/customer-portal/renewal'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalRenewalPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalRenewalClient renewal={null} error='Your portal session has expired. Open your secure link again.' />
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.seasonalRenewal) {
    return <PortalRenewalClient renewal={null} error='Renewal is not enabled for this portal.' />
  }

  try {
    const renewal = await getPortalRenewal(session)

    return <PortalRenewalClient renewal={renewal} />
  } catch {
    return <PortalRenewalClient renewal={null} error='Unable to load renewal.' />
  }
}
