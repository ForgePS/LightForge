import PortalAccountClient from '@components/customer-portal/PortalAccountClient'
import { getPortalEnhancements } from '@libs/customer-portal/enhancements'
import { listPortalProperties } from '@libs/customer-portal/renewal'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalAccountPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalAccountClient initial={null} error='Your portal session has expired. Open your secure link again.' />
  }

  try {
    const [enhancements, properties] = await Promise.all([
      getPortalEnhancements(session),
      listPortalProperties(session)
    ])

    return (
      <PortalAccountClient
        initial={{
          ...enhancements,
          properties: properties.properties.map(property => ({
            id: property.id || '',
            name: property.name || 'Property',
            address: property.address,
            selected: property.selected
          })),
          canSwitch: properties.canSwitch
        }}
      />
    )
  } catch {
    return <PortalAccountClient initial={null} error='Unable to load account.' />
  }
}
