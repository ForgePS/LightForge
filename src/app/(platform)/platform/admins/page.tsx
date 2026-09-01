import { listPlatformAdmins } from '@libs/platform/admin'
import PlatformAdminsClient from '@components/platform/PlatformAdminsClient'
import { requirePlatformAdmin } from '@libs/auth/guards'

export default async function PlatformAdminsPage() {
  const user = await requirePlatformAdmin()
  const admins = await listPlatformAdmins()

  return <PlatformAdminsClient initialAdmins={admins} currentUid={user.uid} />
}
