import PortalProposalsListClient from '@components/customer-portal/PortalProposalsListClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { listPortalProposals } from '@libs/customer-portal/proposals'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalProposalsPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalProposalsListClient
        proposals={[]}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.proposals) {
    return <PortalProposalsListClient proposals={[]} error='Proposals are not enabled for this portal.' />
  }

  try {
    const data = await listPortalProposals(session)

    return <PortalProposalsListClient proposals={data.proposals} />
  } catch {
    return <PortalProposalsListClient proposals={[]} error='Unable to load proposals.' />
  }
}
