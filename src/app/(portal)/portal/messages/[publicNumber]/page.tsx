import PortalMessageThreadClient from '@components/customer-portal/PortalMessageThreadClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalThread } from '@libs/customer-portal/messaging'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

type Params = { params: Promise<{ publicNumber: string }> }

export default async function PortalMessageThreadPage({ params }: Params) {
  const session = await getPortalSessionFromCookie()
  const { publicNumber } = await params

  if (!session) {
    return (
      <PortalMessageThreadClient
        publicNumber={publicNumber}
        subject='Messages'
        messages={[]}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.messages) {
    return (
      <PortalMessageThreadClient
        publicNumber={publicNumber}
        subject='Messages'
        messages={[]}
        error='Messages are not enabled for this portal.'
      />
    )
  }

  try {
    const thread = await getPortalThread(session, decodeURIComponent(publicNumber))

    return (
      <PortalMessageThreadClient
        publicNumber={thread.publicNumber}
        subject={thread.subject}
        messages={thread.messages}
      />
    )
  } catch {
    return (
      <PortalMessageThreadClient
        publicNumber={publicNumber}
        subject='Messages'
        messages={[]}
        error='Unable to load this conversation.'
      />
    )
  }
}
