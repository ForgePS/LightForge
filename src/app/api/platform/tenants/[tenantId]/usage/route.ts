import { NextResponse } from 'next/server'

import { getTenantModuleCounts } from '@libs/platform/admin'
import { requirePlatformAdminApi } from '@libs/platform/api'
import { getDashboardStats } from '@libs/modules/crud'

type Props = { params: Promise<{ tenantId: string }> }

export async function GET(_request: Request, { params }: Props) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { tenantId } = await params
  const [modules, usage] = await Promise.all([getTenantModuleCounts(tenantId), getDashboardStats(tenantId)])

  return NextResponse.json({
    ok: true,
    usage: {
      modules,
      totalRecords: modules.reduce((sum, item) => sum + item.count, 0),
      dashboard: usage
    }
  })
}
