import PortalMessagesClient from '@components/customer-portal/PortalMessagesClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { listPortalThreads } from '@libs/customer-portal/messaging'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalMessagesPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalMessagesClient threads={[]} error='Your portal session has expired. Open your secure link again.' />
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.messages) {
    return <PortalMessagesClient threads={[]} error='Messages are not enabled for this portal.' />
  }

  try {
    const data = await listPortalThreads(session)

    return <PortalMessagesClient threads={data.threads} />
  } catch {
    return <PortalMessagesClient threads={[]} error='Unable to load messages.' />
  }
}
