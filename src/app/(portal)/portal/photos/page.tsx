import PortalPhotosClient from '@components/customer-portal/PortalPhotosClient'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getPortalPhotos } from '@libs/customer-portal/photos'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalPhotosPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return <PortalPhotosClient photos={[]} categories={[]} error='Your portal session has expired. Open your secure link again.' />
  }

  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.photos) {
    return <PortalPhotosClient photos={[]} categories={[]} error='Photos are not enabled for this portal.' />
  }

  try {
    const data = await getPortalPhotos(session)

    return <PortalPhotosClient photos={data.photos} categories={data.categories} />
  } catch {
    return <PortalPhotosClient photos={[]} categories={[]} error='Unable to load photos.' />
  }
}
