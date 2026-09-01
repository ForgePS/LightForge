import { getSessionUser } from '@libs/auth/session'
import { adminDb } from '@libs/firebase/admin'

export async function tryActiveTenantContext() {
  const user = await getSessionUser()

  if (!user) {
    return { error: 'unauthorized' as const }
  }

  if (!user.activeTenantId) {
    return { error: 'no_tenant' as const, user }
  }

  const tenantSnap = await adminDb.collection('tenants').doc(user.activeTenantId).get()

  if (!tenantSnap.exists) {
    return { error: 'no_tenant' as const, user }
  }

  const tenant = tenantSnap.data()!
  const memberSnap = await tenantSnap.ref.collection('members').doc(user.uid).get()

  if (!memberSnap.exists && !user.isPlatformAdmin) {
    return { error: 'forbidden' as const, user }
  }

  return {
    error: null,
    user,
    tenantId: user.activeTenantId,
    tenant,
    role: (memberSnap.data()?.role as string) || (user.isPlatformAdmin ? 'admin' : 'member'),
    accessBlocked:
      tenant.status === 'suspended' ||
      ['canceled', 'paused'].includes(tenant.subscription?.status || '')
  }
}
