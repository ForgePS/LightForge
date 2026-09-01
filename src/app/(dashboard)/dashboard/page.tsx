import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import ConvertTenantDialog from '@components/tenants/ConvertTenantDialog'
import { getActiveTenant, getSessionUser } from '@libs/auth/session'
import { getDashboardStats } from '@libs/modules/crud'
import { formatUsd } from '@libs/subscriptions/plans'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getSessionUser()

  if (!user) redirect('/login')

  const tenant = await getActiveTenant(user)

  if (!tenant) {
    return (
      <Stack spacing={3}>
        <Typography variant='h4'>Dashboard</Typography>
        <Typography color='text.secondary'>
          {user.isPlatformAdmin
            ? 'No tenant selected. Open Platform admin to manage workspaces, or join a tenant.'
            : 'No active workspace. Contact your admin or start a trial.'}
        </Typography>
        {user.isPlatformAdmin && (
          <Button href='/platform' variant='contained' className='self-start'>
            Platform admin
          </Button>
        )}
      </Stack>
    )
  }

  const stats = await getDashboardStats(tenant.id)
  const cards = [
    { label: 'Open jobs', value: stats.openJobs, href: '/jobs' },
    { label: 'Proposal pipeline', value: formatUsd(stats.pipelineCents), href: '/proposals' },
    { label: 'Unpaid invoices', value: formatUsd(stats.unpaidCents), href: '/invoices' },
    { label: 'Schedule today', value: stats.scheduleToday, href: '/schedule' },
    { label: 'Open issues', value: stats.openIssues, href: '/service-issues' }
  ]

  return (
    <Stack spacing={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' flexWrap='wrap' gap={2}>
        <div>
          <Typography variant='h4'>Dashboard</Typography>
          <Typography color='text.secondary'>
            {tenant.name} · {tenant.status}
            {tenant.planId ? ` · ${tenant.planId}` : ''}
          </Typography>
        </div>
        <Stack direction='row' spacing={1} alignItems='center'>
          {tenant.subscriptionStatus && <Chip size='small' label={tenant.subscriptionStatus} />}
          {tenant.status === 'trial' && (tenant.role === 'owner' || tenant.role === 'admin') && (
            <ConvertTenantDialog defaultName={tenant.name} />
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {cards.map(card => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Link href={card.href} className='no-underline'>
              <Card className='h-full'>
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    {card.label}
                  </Typography>
                  <Typography variant='h5'>{card.value}</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant='h6'>Recent jobs</Typography>
                {stats.recentJobs.length === 0 && (
                  <Typography color='text.secondary'>No jobs yet</Typography>
                )}
                {stats.recentJobs.map(job => (
                  <Stack key={String(job.id)} direction='row' justifyContent='space-between'>
                    <Typography>{String(job.title || 'Job')}</Typography>
                    <Chip size='small' label={String(job.status || '—')} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant='h6'>Recent proposals</Typography>
                {stats.recentProposals.length === 0 && (
                  <Typography color='text.secondary'>No proposals yet</Typography>
                )}
                {stats.recentProposals.map(proposal => (
                  <Stack key={String(proposal.id)} direction='row' justifyContent='space-between'>
                    <Typography>{String(proposal.title || 'Proposal')}</Typography>
                    <Chip size='small' label={String(proposal.status || '—')} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
