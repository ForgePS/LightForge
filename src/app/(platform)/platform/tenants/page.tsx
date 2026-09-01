import { listPlatformTenants } from '@libs/platform/admin'
import PlatformTenantsClient from '@components/platform/PlatformTenantsClient'

export default async function PlatformTenantsPage() {
  const [active, all] = await Promise.all([listPlatformTenants(false), listPlatformTenants(true)])
  const archivedTenants = all.filter(tenant => Boolean(tenant.archivedAt))

  return <PlatformTenantsClient initialTenants={active} archivedTenants={archivedTenants} />
}
