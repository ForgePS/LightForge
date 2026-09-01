'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import type { PlatformTenantSummary } from '@libs/firebase/types'
import { formatUsd, estimateMrrCents } from '@libs/subscriptions/plans'

export default function PlatformTenantsClient({
  initialTenants,
  archivedTenants
}: {
  initialTenants: PlatformTenantSummary[]
  archivedTenants: PlatformTenantSummary[]
}) {
  const router = useRouter()
  const [showArchived, setShowArchived] = useState(false)

  const tenants = useMemo(
    () => (showArchived ? [...initialTenants, ...archivedTenants] : initialTenants),
    [showArchived, initialTenants, archivedTenants]
  )

  return (
    <Stack spacing={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={2}>
        <div>
          <Typography variant='h4'>Tenants</Typography>
          <Typography color='text.secondary'>All workspaces on the platform</Typography>
        </div>
        <Stack direction='row' spacing={2} alignItems='center'>
          <FormControlLabel
            control={<Checkbox checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />}
            label='Show archived'
          />
          <Button href='/platform/tenants/new' variant='contained'>
            New tenant
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent className='overflow-x-auto'>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Sub status</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>MRR</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map(tenant => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Typography className='font-medium'>{tenant.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {tenant.slug}
                      {tenant.isTemplate ? ' · template' : ''}
                      {tenant.archivedAt ? ' · archived' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size='small' label={tenant.status} />
                  </TableCell>
                  <TableCell>{tenant.subscription.planId}</TableCell>
                  <TableCell>{tenant.subscription.status}</TableCell>
                  <TableCell>{tenant.memberCount}</TableCell>
                  <TableCell>{formatUsd(estimateMrrCents(tenant.subscription))}</TableCell>
                  <TableCell align='right'>
                    <Button href={`/platform/tenants/${tenant.id}`} size='small' onClick={() => router.refresh()}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  )
}
