import ScheduleWeekBoard from '@components/modules/ScheduleWeekBoard'
import NoTenantState from '@components/tenants/NoTenantState'
import { listRecords } from '@libs/modules/crud'
import { tryActiveTenantContext } from '@libs/modules/tenantContext'

export default async function SchedulePage() {
  const ctx = await tryActiveTenantContext()

  if (ctx.error === 'no_tenant' || ctx.error === 'forbidden' || ctx.error === 'unauthorized') {
    return <NoTenantState title='Schedule' />
  }

  const records = ctx.accessBlocked
    ? []
    : ((await listRecords(ctx.tenantId, 'scheduleEvents')) as Array<Record<string, unknown> & { id: string }>)

  return <ScheduleWeekBoard initialRecords={records} />
}
