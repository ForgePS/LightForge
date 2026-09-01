'use client'

import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { PlatformPageHeader, PlatformStatCard, PlatformStatusChip } from '@components/platform/platformUi'
import type { BillingOverview } from '@libs/firebase/types'
import { formatUsd } from '@libs/subscriptions/plans'

export default function PlatformBillingClient({ billing }: { billing: BillingOverview }) {
  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Billing & subscriptions'
        subtitle='Monitor subscription health, Stripe connections, and revenue across all tenants.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Billing' }
        ]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Est. MRR' value={formatUsd(billing.totalMrrCents)} icon='tabler-currency-dollar' tone='success' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Stripe connected' value={billing.stripeConnectedCount} icon='tabler-brand-stripe' tone='primary' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Past due' value={billing.pastDueTenants.length} icon='tabler-alert-circle' tone='error' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Trialing' value={billing.trialingTenants.length} icon='tabler-hourglass' tone='warning' />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>Subscription status mix</Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {Object.entries(billing.byStatus).map(([status, count]) => (
                <Chip key={status} label={`${status.replace('_', ' ')}: ${count}`} variant='tonal' />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className='h-full'>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Past due tenants
              </Typography>
              {billing.pastDueTenants.length === 0 ? (
                <Typography color='text.secondary'>No past due subscriptions.</Typography>
              ) : (
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell align='right'>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billing.pastDueTenants.map(tenant => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>{tenant.subscription.planId}</TableCell>
                        <TableCell align='right'>
                          <Link href={`/platform/tenants/${tenant.id}`} className='no-underline'>
                            Review
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className='h-full'>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Active trials
              </Typography>
              {billing.trialingTenants.length === 0 ? (
                <Typography color='text.secondary'>No active trials.</Typography>
              ) : (
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align='right'>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billing.trialingTenants.map(tenant => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>
                          <PlatformStatusChip kind='subscription' value={tenant.subscription.status} />
                        </TableCell>
                        <TableCell align='right'>
                          <Link href={`/platform/tenants/${tenant.id}`} className='no-underline'>
                            Manage
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
