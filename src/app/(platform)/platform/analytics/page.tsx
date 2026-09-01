import { getPlatformAnalytics } from '@libs/platform/admin'
import PlatformAnalyticsClient from '@components/platform/PlatformAnalyticsClient'

export default async function PlatformAnalyticsPage() {
  const analytics = await getPlatformAnalytics()

  return <PlatformAnalyticsClient analytics={analytics} />
}
