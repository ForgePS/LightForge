import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { getAllModuleKeys, isModuleKey } from '@libs/modules/moduleAccess'

const MODULES_DOC = 'modules'

export { getAllModuleKeys, isModuleKey, isModuleEnabledForTenant, moduleKeyForPath } from '@libs/modules/moduleAccess'

export async function getTenantEnabledModules(tenantId: string): Promise<string[]> {
  const snap = await adminDb.collection('tenants').doc(tenantId).collection('settings').doc(MODULES_DOC).get()

  if (!snap.exists) {
    return getAllModuleKeys()
  }

  const enabled = snap.data()?.enabled

  if (!Array.isArray(enabled)) {
    return getAllModuleKeys()
  }

  return enabled.filter(isModuleKey)
}

export async function setTenantEnabledModules(tenantId: string, enabled: string[]) {
  const unique = [...new Set(enabled.filter(isModuleKey))]

  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('settings')
    .doc(MODULES_DOC)
    .set(
      {
        enabled: unique,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  return unique
}

export async function activateAllTenantModules(tenantId: string) {
  return setTenantEnabledModules(tenantId, getAllModuleKeys())
}

export async function deactivateAllTenantModules(tenantId: string) {
  return setTenantEnabledModules(tenantId, [])
}
