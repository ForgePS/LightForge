import { notFound } from 'next/navigation'

import ModulePageClient from '@components/modules/ModulePageClient'
import NoTenantState from '@components/tenants/NoTenantState'
import { listRecords } from '@libs/modules/crud'
import { getModule } from '@libs/modules/registry'
import { tryActiveTenantContext } from '@libs/modules/tenantContext'

export async function ModulePage({ moduleKey }: { moduleKey: string }) {
  const module = getModule(moduleKey)

  if (!module) notFound()

  const ctx = await tryActiveTenantContext()

  if (ctx.error === 'unauthorized') {
    notFound()
  }

  if (ctx.error === 'no_tenant' || ctx.error === 'forbidden') {
    return <NoTenantState title={module.title} />
  }

  const records = ctx.accessBlocked
    ? []
    : ((await listRecords(ctx.tenantId, module.collection)) as Array<Record<string, unknown> & { id: string }>)

  return <ModulePageClient module={module} initialRecords={records} />
}
