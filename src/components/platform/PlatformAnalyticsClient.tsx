'use client'

import Link from 'next/link'
import Box from '@mui/material/Box'
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

import { PlatformPageHeader, PlatformStatCard } from '@components/platform/platformUi'
import type { PlatformAnalytics } from '@libs/firebase/types'
import { formatUsd } from '@libs/subscriptions/plans'

export default function PlatformAnalyticsClient({ analytics }: { analytics: PlatformAnalytics }) {
  const maxModule = analytics.moduleTotals[0]?.count || 1
  const maxGrowth = Math.max(...analytics.tenantGrowth.map(item => item.count), 1)

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Analytics'
        subtitle='Cross-tenant usage, module adoption, and growth across the entire platform.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Analytics' }
        ]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Total records' value={analytics.totalRecords.toLocaleString()} icon='tabler-database' tone='primary' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Open jobs' value={analytics.aggregateUsage.openJobs} icon='tabler-briefcase' tone='info' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Pipeline' value={formatUsd(analytics.aggregateUsage.pipelineCents)} icon='tabler-chart-line' tone='success' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Open issues' value={analytics.aggregateUsage.openIssues} icon='tabler-alert-triangle' tone='warning' />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card className='h-full'>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Module adoption (all tenants)
              </Typography>
              <Stack spacing={2}>
                {analytics.moduleTotals.slice(0, 12).map(item => (
                  <Box key={item.collection}>
                    <Stack direction='row' justifyContent='space-between' sx={{ mb: 0.5 }}>
                      <Typography variant='body2'>{item.title}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {item.count}
                      </Typography>
                    </Stack>
                    <LinearProgress variant='determinate' value={(item.count / maxModule) * 100} sx={{ height: 8, borderRadius: 999 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Tenant growth
                </Typography>
                <Stack spacing={2}>
                  {analytics.tenantGrowth.map(item => (
                    <Box key={item.month}>
                      <Stack direction='row' justifyContent='space-between' sx={{ mb: 0.5 }}>
                        <Typography variant='body2'>{item.month}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {item.count}
                        </Typography>
                      </Stack>
                      <LinearProgress variant='determinate' value={(item.count / maxGrowth) * 100} sx={{ height: 8, borderRadius: 999 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Top tenants by data volume
                </Typography>
                <Table size='small'>
                  <TableBody>
                    {analytics.topTenantsByRecords.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link href={`/platform/tenants/${item.id}`} className='no-underline'>
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell align='right'>{item.recordCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Top tenants by members
          </Typography>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell align='right'>Members</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.topTenantsByMembers.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link href={`/platform/tenants/${item.id}`} className='no-underline'>
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell align='right'>{item.memberCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  )
}
