'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { PlatformStatCard } from '@components/platform/platformUi'
import { formatUsd } from '@libs/subscriptions/plans'

type UsagePayload = {
  modules: Array<{ collection: string; title: string; count: number }>
  totalRecords: number
  dashboard: {
    openJobs: number
    pipelineCents: number
    unpaidCents: number
    openIssues: number
  }
}

export default function TenantUsagePanel({ tenantId }: { tenantId: string }) {
  const [usage, setUsage] = useState<UsagePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/platform/tenants/${tenantId}/usage`)
      .then(res => res.json())
      .then(data => {
        if (!data.ok) throw new Error(data.error || 'Unable to load usage')
        setUsage(data.usage)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load usage'))
  }, [tenantId])

  if (error) {
    return <Typography color='error'>{error}</Typography>
  }

  if (!usage) {
    return (
      <Stack alignItems='center' sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    )
  }

  const maxCount = usage.modules[0]?.count || 1

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Total records' value={usage.totalRecords} icon='tabler-database' tone='primary' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Open jobs' value={usage.dashboard.openJobs} icon='tabler-briefcase' tone='info' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Pipeline' value={formatUsd(usage.dashboard.pipelineCents)} icon='tabler-chart-line' tone='success' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlatformStatCard label='Open issues' value={usage.dashboard.openIssues} icon='tabler-alert-triangle' tone='warning' />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Module record counts
          </Typography>
          <Stack spacing={2}>
            {usage.modules.map(item => (
              <Box key={item.collection}>
                <Stack direction='row' justifyContent='space-between' sx={{ mb: 0.5 }}>
                  <Typography variant='body2'>{item.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.count}
                  </Typography>
                </Stack>
                <LinearProgress variant='determinate' value={maxCount ? (item.count / maxCount) * 100 : 0} sx={{ height: 8, borderRadius: 999 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
