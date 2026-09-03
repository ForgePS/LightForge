import PortalServiceListClient from '@components/customer-portal/PortalServiceListClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { listPortalServiceRequests } from '@libs/customer-portal/serviceRequests'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalServicePage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalServiceListClient requests={[]} error='Your portal session has expired. Open your secure link again.' />
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.serviceRequests) {
    return <PortalServiceListClient requests={[]} error='Service requests are not enabled for this portal.' />
  }

  try {
    const data = await listPortalServiceRequests(session)

    return <PortalServiceListClient requests={data.requests} />
  } catch {
    return <PortalServiceListClient requests={[]} error='Unable to load service requests.' />
  }
}
