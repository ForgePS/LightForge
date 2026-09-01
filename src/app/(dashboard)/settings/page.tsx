import { adminDb } from '@libs/firebase/admin'
import SettingsClient from '@components/settings/SettingsClient'
import NoTenantState from '@components/tenants/NoTenantState'
import { tryActiveTenantContext } from '@libs/modules/tenantContext'

export default async function SettingsPage() {
  const ctx = await tryActiveTenantContext()

  if (ctx.error) {
    return <NoTenantState title='Settings' />
  }

  const settingsSnap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('settings').doc('general').get()
  const membersSnap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('members').get()

  const initialSettings = settingsSnap.exists
    ? settingsSnap.data()!
    : {
        companyName: ctx.tenant.name,
        timezone: 'America/New_York',
        supportEmail: ctx.user.email
      }

  const members = membersSnap.docs.map(doc => {
    const data = doc.data()

    return {
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      role: data.role || 'member'
    }
  })

  return <SettingsClient initialSettings={initialSettings} members={members} />
}
