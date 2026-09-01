import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Link from 'next/link'

import { getPlatformStats, listPlatformTenants } from '@libs/platform/admin'
import { formatUsd } from '@libs/subscriptions/plans'

export default async function PlatformOverviewPage() {
  const [stats, tenants] = await Promise.all([getPlatformStats(), listPlatformTenants()])
  const recent = tenants.slice(0, 8)

  const cards = [
    { label: 'Tenants', value: stats.tenantCount },
    { label: 'Active', value: stats.activeCount },
    { label: 'Trials', value: stats.trialCount },
    { label: 'Suspended', value: stats.suspendedCount },
    { label: 'Members', value: stats.memberCount },
    { label: 'Est. MRR', value: formatUsd(stats.mrrCents) }
  ]

  return (
    <Stack spacing={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={2}>
        <div>
          <Typography variant='h4'>Platform overview</Typography>
          <Typography color='text.secondary'>Manage every LightForge tenant and subscription</Typography>
        </div>
        <Button href='/platform/tenants/new' variant='contained'>
          New tenant
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {cards.map(card => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <Card>
              <CardContent>
                <Typography variant='body2' color='text.secondary'>
                  {card.label}
                </Typography>
                <Typography variant='h5'>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>Plans in use</Typography>
            <Stack direction='row' gap={1} flexWrap='wrap'>
              {Object.entries(stats.plansInUse).map(([plan, count]) => (
                <Chip key={plan} label={`${plan}: ${count}`} />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='h6'>Tenants</Typography>
              <Button href='/platform/tenants' size='small'>
                View all
              </Button>
            </Stack>
            {recent.map(tenant => (
              <Stack
                key={tenant.id}
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                className='border-be pbe-2'
              >
                <div>
                  <Link href={`/platform/tenants/${tenant.id}`} className='no-underline'>
                    <Typography color='primary.main'>{tenant.name}</Typography>
                  </Link>
                  <Typography variant='caption' display='block' color='text.secondary'>
                    {tenant.subscription.planId} · {tenant.subscription.status}
                  </Typography>
                </div>
                <Chip size='small' label={tenant.status} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
