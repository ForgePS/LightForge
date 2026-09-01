'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import {
  PlatformPageHeader,
  PlatformStatusChip,
  formatPlatformDate,
  tenantInitials
} from '@components/platform/platformUi'
import type { PlatformTenantSummary } from '@libs/firebase/types'
import { formatUsd, estimateMrrCents } from '@libs/subscriptions/plans'

type FilterTab = 'all' | 'active' | 'trial' | 'suspended' | 'template'

export default function PlatformTenantsClient({
  initialTenants,
  archivedTenants
}: {
  initialTenants: PlatformTenantSummary[]
  archivedTenants: PlatformTenantSummary[]
}) {
  const router = useRouter()
  const [showArchived, setShowArchived] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  const tenants = useMemo(
    () => (showArchived ? [...initialTenants, ...archivedTenants] : initialTenants),
    [showArchived, initialTenants, archivedTenants]
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return tenants.filter(tenant => {
      if (filter === 'active' && tenant.status !== 'active') return false
      if (filter === 'trial' && tenant.status !== 'trial') return false
      if (filter === 'suspended' && tenant.status !== 'suspended') return false
      if (filter === 'template' && !tenant.isTemplate) return false

      if (!normalized) return true

      return (
        tenant.name.toLowerCase().includes(normalized) ||
        tenant.slug.toLowerCase().includes(normalized) ||
        tenant.subscription.planId.toLowerCase().includes(normalized)
      )
    })
  }, [tenants, query, filter])

  const summary = useMemo(
    () => ({
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      trial: tenants.filter(t => t.status === 'trial').length,
      suspended: tenants.filter(t => t.status === 'suspended').length,
      mrr: tenants.reduce((sum, tenant) => sum + estimateMrrCents(tenant.subscription), 0)
    }),
    [tenants]
  )

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Tenants'
        subtitle='Search, filter, and manage every workspace on the platform.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Tenants' }
        ]}
        actions={
          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControlLabel
              control={<Checkbox checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />}
              label='Show archived'
            />
            <Button href='/platform/tenants/new' variant='contained' startIcon={<i className='tabler-plus' />}>
              New tenant
            </Button>
          </Stack>
        }
      />

      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        <Chip label={`${summary.total} total`} variant='tonal' />
        <Chip label={`${summary.active} active`} color='success' variant='tonal' />
        <Chip label={`${summary.trial} trials`} color='warning' variant='tonal' />
        <Chip label={`${summary.suspended} suspended`} color='error' variant='tonal' />
        <Chip label={`MRR ${formatUsd(summary.mrr)}`} color='primary' variant='tonal' />
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <CustomTextField
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search by name, slug, or plan…'
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
                }
              }}
            />

            <Tabs value={filter} onChange={(_, value: FilterTab) => setFilter(value)} variant='scrollable'>
              <Tab label='All' value='all' />
              <Tab label='Active' value='active' />
              <Tab label='Trials' value='trial' />
              <Tab label='Suspended' value='suspended' />
              <Tab label='Templates' value='template' />
            </Tabs>

            <Box className='overflow-x-auto'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Subscription</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>MRR</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Stack alignItems='center' spacing={1} sx={{ py: 6 }}>
                          <i className='tabler-building-off text-4xl text-textSecondary' />
                          <Typography color='text.secondary'>No tenants match your filters.</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map(tenant => (
                    <TableRow key={tenant.id} hover>
                      <TableCell>
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                            {tenantInitials(tenant.name)}
                          </Avatar>
                          <Box>
                            <Typography className='font-medium'>{tenant.name}</Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {tenant.slug}
                              {tenant.isTemplate ? ' · template' : ''}
                              {tenant.archivedAt ? ' · archived' : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <PlatformStatusChip kind='tenant' value={tenant.status} />
                      </TableCell>
                      <TableCell className='capitalize'>{tenant.subscription.planId}</TableCell>
                      <TableCell>
                        <PlatformStatusChip kind='subscription' value={tenant.subscription.status} />
                      </TableCell>
                      <TableCell>{tenant.memberCount}</TableCell>
                      <TableCell>{formatUsd(estimateMrrCents(tenant.subscription))}</TableCell>
                      <TableCell>{formatPlatformDate(tenant.createdAt)}</TableCell>
                      <TableCell align='right'>
                        <Button href={`/platform/tenants/${tenant.id}`} size='small' onClick={() => router.refresh()}>
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
