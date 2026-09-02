import 'server-only'

import { cookies } from 'next/headers'

import { adminAuth, adminDb } from '@libs/firebase/admin'
import { isPlatformAdmin } from '@libs/platform/admin'
import { getTenantEnabledModules } from '@libs/modules/tenantModules'
import { getTenantBranding } from '@libs/branding/storage'
import type { ActiveTenantInfo, MemberRole, SessionUser, TenantStatus } from '@libs/firebase/types'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__session'

function sessionMaxAgeMs() {
  const days = Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS || 14)

  return days * 24 * 60 * 60 * 1000
}

export async function createSessionCookie(idToken: string) {
  const expiresIn = sessionMaxAgeMs()
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn / 1000
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get()
    const data = userSnap.data()
    const platformAdmin =
      Boolean(decoded.platformAdmin) || Boolean(data?.isPlatformAdmin) || (await isPlatformAdmin(decoded.uid))

    return {
      uid: decoded.uid,
      email: decoded.email || data?.email || '',
      displayName: data?.displayName || decoded.name || decoded.email || 'User',
      activeTenantId: data?.activeTenantId ?? null,
      isPlatformAdmin: platformAdmin
    }
  } catch {
    return null
  }
}

export async function getActiveTenant(user: SessionUser): Promise<ActiveTenantInfo | null> {
  if (!user.activeTenantId) {
    return null
  }

  const tenantRef = adminDb.collection('tenants').doc(user.activeTenantId)
  const [tenantSnap, memberSnap] = await Promise.all([
    tenantRef.get(),
    tenantRef.collection('members').doc(user.uid).get()
  ])

  if (!tenantSnap.exists || !memberSnap.exists) {
    return null
  }

  const tenant = tenantSnap.data()!
  const member = memberSnap.data()!
  const [enabledModules, branding] = await Promise.all([
    getTenantEnabledModules(tenantSnap.id),
    getTenantBranding(tenantSnap.id)
  ])

  return {
    id: tenantSnap.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status as TenantStatus,
    role: member.role as MemberRole,
    subscriptionStatus: tenant.subscription?.status,
    planId: tenant.subscription?.planId,
    seats: tenant.subscription?.seats,
    enabledModules,
    branding
  }

}

export async function listUserTenants(uid: string): Promise<ActiveTenantInfo[]> {
  const membershipsSnap = await adminDb.collection('users').doc(uid).collection('tenantMemberships').get()
  const results: ActiveTenantInfo[] = []

  for (const membershipDoc of membershipsSnap.docs) {
    const tenantId = membershipDoc.id
    const membership = membershipDoc.data()
    const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get()

    if (!tenantSnap.exists) continue

    const tenant = tenantSnap.data()!
    const enabledModules = await getTenantEnabledModules(tenantId)

    results.push({
      id: tenantSnap.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status as TenantStatus,
      role: (membership.role || 'member') as MemberRole,
      subscriptionStatus: tenant.subscription?.status,
      planId: tenant.subscription?.planId,
      seats: tenant.subscription?.seats,
      enabledModules
    })
  }

  return results.sort((a, b) => a.name.localeCompare(b.name))
}
