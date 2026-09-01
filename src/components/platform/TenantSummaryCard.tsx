import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

import { PlatformStatusChip } from '@components/platform/platformUi'
import { formatPlatformDate } from '@libs/platform/format'
import { formatUsd } from '@libs/subscriptions/plans'

type TenantSummary = {
  id: string
  name: string
  slug: string
  status: string
  isTemplate: boolean
  archivedAt?: string | null
  createdAt: string | null
  updatedAt: string | null
  subscription: {
    planId: string
    status: string
    seats: number
    priceCents: number | null
    trialEndsAt: string | null
    currentPeriodEnd: string | null
  }
  members: Array<{ uid: string }>
}

export default function TenantSummaryCard({ tenant }: { tenant: TenantSummary }) {
  const items = [
    { label: 'Tenant status', value: <PlatformStatusChip kind='tenant' value={tenant.status} /> },
    { label: 'Subscription', value: <PlatformStatusChip kind='subscription' value={tenant.subscription.status} /> },
    { label: 'Plan', value: <Typography className='capitalize font-medium'>{tenant.subscription.planId}</Typography> },
    { label: 'Seats', value: tenant.subscription.seats },
    { label: 'Members', value: tenant.members.length },
    { label: 'Price', value: formatUsd(tenant.subscription.priceCents || 0) },
    { label: 'Trial ends', value: formatPlatformDate(tenant.subscription.trialEndsAt) },
    { label: 'Period ends', value: formatPlatformDate(tenant.subscription.currentPeriodEnd) },
    { label: 'Created', value: formatPlatformDate(tenant.createdAt) },
    { label: 'Updated', value: formatPlatformDate(tenant.updatedAt) }
  ]

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {tenant.isTemplate && <Chip size='small' label='Template tenant' color='info' variant='tonal' />}
            {tenant.archivedAt && <Chip size='small' label='Archived' color='warning' variant='tonal' />}
          </Stack>
          <Grid container spacing={3}>
            {items.map(item => (
              <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  {item.label}
                </Typography>
                <BoxValue>{item.value}</BoxValue>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  )
}

function BoxValue({ children }: { children: ReactNode }) {
  return typeof children === 'string' || typeof children === 'number' ? (
    <Typography className='font-medium'>{children}</Typography>
  ) : (
    <>{children}</>
  )
}
