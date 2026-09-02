import { getPlatformBranding } from '@libs/branding/storage'
import { getPlatformSettings } from '@libs/platform/admin'
import PlatformSettingsClient from '@components/platform/PlatformSettingsClient'

export default async function PlatformSettingsPage() {
  const [settings, branding] = await Promise.all([getPlatformSettings(), getPlatformBranding()])

  return <PlatformSettingsClient initialSettings={{ ...settings, branding }} />
}
