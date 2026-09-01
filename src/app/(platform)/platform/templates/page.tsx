import { listTenantTemplates } from '@libs/platform/admin'
import PlatformTemplatesClient from '@components/platform/PlatformTemplatesClient'

export default async function PlatformTemplatesPage() {
  const templates = await listTenantTemplates()

  return <PlatformTemplatesClient templates={templates} />
}
