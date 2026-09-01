import { redirect } from 'next/navigation'

import { getActiveTenant, getSessionUser } from '@libs/auth/session'

export async function requireSession(redirectTo = '/login') {
  const user = await getSessionUser()

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

export async function requireGuest(redirectTo = '/dashboard') {
  const user = await getSessionUser()

  if (user) {
    redirect(redirectTo)
  }
}

export async function requireSessionWithTenant() {
  const user = await requireSession()
  const tenant = await getActiveTenant(user)

  return { user, tenant }
}

export async function requirePlatformAdmin(redirectTo = '/home') {
  const user = await requireSession()

  if (!user.isPlatformAdmin) {
    redirect(redirectTo)
  }

  return user
}
