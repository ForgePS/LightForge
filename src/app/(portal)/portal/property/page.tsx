import PortalPropertyClient from '@components/customer-portal/PortalPropertyClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { listPortalProperty } from '@libs/customer-portal/property'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalPropertyPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalPropertyClient
        property={null}
        pendingChanges={[]}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.propertyInformation) {
    return (
      <PortalPropertyClient property={null} pendingChanges={[]} error='Property information is not enabled for this portal.' />
    )
  }

  try {
    const data = await listPortalProperty(session)

    return <PortalPropertyClient property={data.property} pendingChanges={data.pendingChanges} />
  } catch {
    return <PortalPropertyClient property={null} pendingChanges={[]} error='Unable to load property details.' />
  }
}
