import PortalServiceDetailClient from '@components/customer-portal/PortalServiceDetailClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalServiceRequest } from '@libs/customer-portal/serviceRequests'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

type Props = { params: Promise<{ publicRequestNumber: string }> }

export default async function PortalServiceDetailPage({ params }: Props) {
  const { publicRequestNumber } = await params
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalServiceDetailClient
        request={null}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.serviceRequests) {
    return <PortalServiceDetailClient request={null} error='Service requests are not enabled for this portal.' />
  }

  try {
    const request = await getPortalServiceRequest(session, publicRequestNumber)

    return <PortalServiceDetailClient request={request} />
  } catch {
    return <PortalServiceDetailClient request={null} error='Service request not found.' />
  }
}
