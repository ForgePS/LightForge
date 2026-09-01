import { listPlatformUsers } from '@libs/platform/admin'
import PlatformUsersClient from '@components/platform/PlatformUsersClient'

export default async function PlatformUsersPage() {
  const users = await listPlatformUsers()

  return <PlatformUsersClient initialUsers={users} />
}
