import Link from 'next/link'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import {
  PlatformPageHeader,
  PlatformQuickAction,
  PlatformStatCard,
  PlatformStatusChip,
  formatPlatformDate,
  tenantInitials
} from '@components/platform/platformUi'
import { getPlatformStats, listPlatformTenants } from '@libs/platform/admin'
import { formatUsd } from '@libs/subscriptions/plans'

export default async function PlatformOverviewPage() {
  const [stats, tenants] = await Promise.all([getPlatformStats(), listPlatformTenants()])
  const recent = [...tenants]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10)
  const planEntries = Object.entries(stats.plansInUse).sort((a, b) => b[1] - a[1])
  const maxPlanCount = planEntries[0]?.[1] || 1

  const statCards = [
    { label: 'Total tenants', value: stats.tenantCount, icon: 'tabler-building', tone: 'primary' as const, helper: `${stats.newTenantsThisMonth} new this month` },
    { label: 'Active', value: stats.activeCount, icon: 'tabler-circle-check', tone: 'success' as const, helper: `${stats.templateCount} templates` },
    { label: 'Trials', value: stats.trialCount, icon: 'tabler-hourglass', tone: 'warning' as const, helper: `${stats.trialsExpiringSoon.length} expiring soon` },
    { label: 'Suspended', value: stats.suspendedCount, icon: 'tabler-ban', tone: 'error' as const, helper: `${stats.canceledCount} canceled subs` },
    { label: 'Members', value: stats.memberCount, icon: 'tabler-users', tone: 'info' as const, helper: 'Across all tenants' },
    { label: 'Est. MRR', value: formatUsd(stats.mrrCents), icon: 'tabler-currency-dollar', tone: 'secondary' as const, helper: `${stats.archivedCount} archived` }
  ]

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Platform overview'
        subtitle='Monitor tenant health, subscription mix, and onboarding activity across LightForge.'
        actions={
          <Stack direction='row' spacing={1}>
            <Button href='/platform/tenants' variant='outlined'>
              All tenants
            </Button>
            <Button href='/platform/tenants/new' variant='contained' startIcon={<i className='tabler-plus' />}>
              New tenant
            </Button>
          </Stack>
        }
      />

      {(stats.trialsExpiringSoon.length > 0 || stats.suspendedCount > 0) && (
        <Stack spacing={1.5}>
          {stats.trialsExpiringSoon.length > 0 && (
            <Alert severity='warning' icon={<i className='tabler-alert-triangle' />}>
              {stats.trialsExpiringSoon.length} trial{stats.trialsExpiringSoon.length === 1 ? '' : 's'} expiring within 7 days. Review billing before they lapse.
            </Alert>
          )}
          {stats.suspendedCount > 0 && (
            <Alert severity='error' icon={<i className='tabler-ban' />}>
              {stats.suspendedCount} tenant{stats.suspendedCount === 1 ? ' is' : 's are'} suspended and cannot access the app.
            </Alert>
          )}
        </Stack>
      )}

      <Grid container spacing={3}>
        {statCards.map(card => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <PlatformStatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='h6'>Recent tenants</Typography>
                  <Button href='/platform/tenants' size='small'>
                    View all
                  </Button>
                </Stack>
                <Box className='overflow-x-auto'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tenant</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Members</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recent.map(tenant => (
                        <TableRow key={tenant.id} hover>
                          <TableCell>
                            <Stack direction='row' spacing={2} alignItems='center'>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                {tenantInitials(tenant.name)}
                              </Avatar>
                              <Box>
                                <Link href={`/platform/tenants/${tenant.id}`} className='no-underline'>
                                  <Typography color='primary.main' className='font-medium'>
                                    {tenant.name}
                                  </Typography>
                                </Link>
                                <Typography variant='caption' color='text.secondary' display='block'>
                                  {tenant.slug}
                                  {tenant.isTemplate ? ' · template' : ''}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <PlatformStatusChip kind='tenant' value={tenant.status} />
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant='body2'>{tenant.subscription.planId}</Typography>
                              <PlatformStatusChip kind='subscription' value={tenant.subscription.status} />
                            </Stack>
                          </TableCell>
                          <TableCell>{tenant.memberCount}</TableCell>
                          <TableCell>{formatPlatformDate(tenant.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant='h6'>Plan distribution</Typography>
                  {planEntries.length === 0 && <Typography color='text.secondary'>No tenants yet</Typography>}
                  {planEntries.map(([plan, count]) => (
                    <Box key={plan}>
                      <Stack direction='row' justifyContent='space-between' sx={{ mb: 0.5 }}>
                        <Typography variant='body2' className='capitalize'>
                          {plan}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {count}
                        </Typography>
                      </Stack>
                      <LinearProgress variant='determinate' value={(count / maxPlanCount) * 100} sx={{ height: 8, borderRadius: 999 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant='h6'>Trials ending soon</Typography>
                  {stats.trialsExpiringSoon.length === 0 ? (
                    <Typography color='text.secondary'>No trials expiring in the next 7 days.</Typography>
                  ) : (
                    stats.trialsExpiringSoon.map(tenant => (
                      <Stack key={tenant.id} direction='row' justifyContent='space-between' alignItems='center'>
                        <Box>
                          <Link href={`/platform/tenants/${tenant.id}`} className='no-underline'>
                            <Typography color='primary.main'>{tenant.name}</Typography>
                          </Link>
                          <Typography variant='caption' color='text.secondary'>
                            Ends {formatPlatformDate(tenant.subscription.trialEndsAt)}
                          </Typography>
                        </Box>
                        <Button href={`/platform/tenants/${tenant.id}`} size='small'>
                          Review
                        </Button>
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Box>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Admin sections
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Tenants' description='Manage workspaces, status, and archive state.' href='/platform/tenants' icon='tabler-building' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Users' description='Search every account and their tenant memberships.' href='/platform/users' icon='tabler-users' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Billing' description='Review MRR, past due accounts, and Stripe status.' href='/platform/billing' icon='tabler-receipt' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Analytics' description='Cross-tenant module adoption and growth metrics.' href='/platform/analytics' icon='tabler-chart-bar' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Templates' description='View clone sources for trial provisioning.' href='/platform/templates' icon='tabler-copy' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Platform admins' description='Grant or revoke control center access.' href='/platform/admins' icon='tabler-shield-lock' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Plans' description='Edit the subscription catalog and pricing.' href='/platform/plans' icon='tabler-credit-card' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlatformQuickAction title='Settings' description='Platform-wide onboarding and support config.' href='/platform/settings' icon='tabler-settings' />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  )
}
