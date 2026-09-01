import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'

import TenantAdminDetail from '@components/platform/TenantAdminDetail'
import TenantSummaryCard from '@components/platform/TenantSummaryCard'
import { PlatformPageHeader } from '@components/platform/platformUi'
import { getPlatformTenant } from '@libs/platform/admin'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ tenantId: string }> }

export default async function PlatformTenantDetailPage({ params }: Props) {
  const { tenantId } = await params
  const tenant = await getPlatformTenant(tenantId)

  if (!tenant) notFound()

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title={tenant.name}
        subtitle={`${tenant.slug} · ${tenant.id}`}
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Tenants', href: '/platform/tenants' },
          { label: tenant.name }
        ]}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TenantSummaryCard tenant={tenant} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TenantAdminDetail tenant={tenant} />
        </Grid>
      </Grid>
    </Stack>
  )
}
