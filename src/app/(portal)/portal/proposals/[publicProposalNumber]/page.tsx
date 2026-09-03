import PortalProposalDetailClient from '@components/customer-portal/PortalProposalDetailClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalProposal } from '@libs/customer-portal/proposals'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

type Props = { params: Promise<{ publicProposalNumber: string }> }

export default async function PortalProposalDetailPage({ params }: Props) {
  const { publicProposalNumber } = await params
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalProposalDetailClient
        initial={null}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.proposals) {
    return <PortalProposalDetailClient initial={null} error='Proposals are not enabled for this portal.' />
  }

  try {
    const proposal = await getPortalProposal(session, publicProposalNumber)

    return <PortalProposalDetailClient initial={proposal} />
  } catch {
    return <PortalProposalDetailClient initial={null} error='Proposal not found.' />
  }
}
