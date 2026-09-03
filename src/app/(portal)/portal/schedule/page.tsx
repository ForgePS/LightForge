import PortalScheduleClient from '@components/customer-portal/PortalScheduleClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalSchedule } from '@libs/customer-portal/schedule'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalSchedulePage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalScheduleClient schedule={null} error='Your portal session has expired. Open your secure link again.' />
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.schedule) {
    return <PortalScheduleClient schedule={null} error='Schedule is not enabled for this portal.' />
  }

  try {
    const schedule = await getPortalSchedule(session)

    return <PortalScheduleClient schedule={schedule} />
  } catch {
    return <PortalScheduleClient schedule={null} error='Unable to load schedule.' />
  }
}
