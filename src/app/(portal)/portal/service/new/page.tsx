import PortalServiceNewClient from '@components/customer-portal/PortalServiceNewClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { PROBLEM_LOCATIONS, PROBLEM_TYPES } from '@libs/customer-portal/serviceRequests'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'
import PortalShell from '@components/customer-portal/PortalShell'
import Alert from '@mui/material/Alert'

export default async function PortalServiceNewPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalShell title='Report a Lighting Issue'>
        <Alert severity='warning'>Your portal session has expired. Open your secure link again.</Alert>
      </PortalShell>
    )
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.serviceRequests) {
    return (
      <PortalShell title='Report a Lighting Issue'>
        <Alert severity='info'>Service requests are not enabled for this portal.</Alert>
      </PortalShell>
    )
  }

  return (
    <PortalServiceNewClient problemTypes={[...PROBLEM_TYPES]} problemLocations={[...PROBLEM_LOCATIONS]} />
  )
}
