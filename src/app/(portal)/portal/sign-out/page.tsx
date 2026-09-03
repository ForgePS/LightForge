import { redirect } from 'next/navigation'

import { revokeCurrentPortalSession } from '@libs/customer-portal/session'

export default async function PortalSignOutPage() {
  await revokeCurrentPortalSession()
  redirect('/')
}
