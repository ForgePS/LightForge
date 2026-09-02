import { getPlatformSettings } from '@libs/platform/admin'
import PlatformSettingsClient from '@components/platform/PlatformSettingsClient'

export default async function PlatformSettingsPage() {
  const settings = await getPlatformSettings()

  return <PlatformSettingsClient initialSettings={settings} />
}
