import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import NoTenantState from '@components/tenants/NoTenantState'
import { getDashboardStats } from '@libs/modules/crud'
import { adminDb } from '@libs/firebase/admin'
import { formatUsd } from '@libs/subscriptions/plans'
import { tryActiveTenantContext } from '@libs/modules/tenantContext'

export default async function ReportsPage() {
  const ctx = await tryActiveTenantContext()

  if (ctx.error) {
    return <NoTenantState title='Reports' />
  }

  const stats = await getDashboardStats(ctx.tenantId)
  const jobsSnap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('jobs').get()

  const byStatus = jobsSnap.docs.reduce<Record<string, number>>((acc, doc) => {
    const status = String(doc.data().status || 'unknown')

    acc[status] = (acc[status] || 0) + 1

    return acc
  }, {})

  return (
    <Stack spacing={4}>
      <div>
        <Typography variant='h4'>Reports</Typography>
        <Typography color='text.secondary'>Live summaries for this workspace</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Proposal pipeline
              </Typography>
              <Typography variant='h5'>{formatUsd(stats.pipelineCents)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Unpaid invoices
              </Typography>
              <Typography variant='h5'>{formatUsd(stats.unpaidCents)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Open service issues
              </Typography>
              <Typography variant='h5'>{stats.openIssues}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>Jobs by status</Typography>
            {Object.keys(byStatus).length === 0 && (
              <Typography color='text.secondary'>No jobs yet</Typography>
            )}
            {Object.entries(byStatus).map(([status, count]) => (
              <Stack key={status} direction='row' justifyContent='space-between'>
                <Typography>{status}</Typography>
                <Typography>{count}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
