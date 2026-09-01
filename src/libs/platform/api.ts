import { NextResponse } from 'next/server'

import { getSessionUser } from '@libs/auth/session'

export async function requirePlatformAdminApi() {
  const user = await getSessionUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (!user.isPlatformAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}
