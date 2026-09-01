import { notFound } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import TenantAdminDetail from '@components/platform/TenantAdminDetail'
import { getPlatformTenant } from '@libs/platform/admin'

type Props = { params: Promise<{ tenantId: string }> }

export default async function PlatformTenantDetailPage({ params }: Props) {
  const { tenantId } = await params
  const tenant = await getPlatformTenant(tenantId)

  if (!tenant) notFound()

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant='h4'>{tenant.name}</Typography>
        <Typography color='text.secondary'>
          {tenant.slug} · {tenant.id}
        </Typography>
      </div>
      <TenantAdminDetail tenant={tenant} />
    </Stack>
  )
}
