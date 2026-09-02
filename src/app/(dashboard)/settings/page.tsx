import SettingsClient from '@components/settings/SettingsClient'
import NoTenantState from '@components/tenants/NoTenantState'
import { getTenantGeneralSettings } from '@libs/platform/admin'
import { tryActiveTenantContext } from '@libs/modules/tenantContext'
import { adminDb } from '@libs/firebase/admin'

export default async function SettingsPage() {
  const ctx = await tryActiveTenantContext()

  if (ctx.error) {
    return <NoTenantState title='Settings' />
  }

  const [generalSettings, membersSnap] = await Promise.all([
    getTenantGeneralSettings(ctx.tenantId),
    adminDb.collection('tenants').doc(ctx.tenantId).collection('members').get()
  ])

  const initialSettings = {
    companyName: generalSettings.companyName || ctx.tenant.name,
    timezone: generalSettings.timezone || 'America/New_York',
    supportEmail: generalSettings.supportEmail || ctx.user.email,
    branding: generalSettings.branding
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
