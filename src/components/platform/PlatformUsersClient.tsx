'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import { PlatformPageHeader } from '@components/platform/platformUi'
import { formatPlatformDate, tenantInitials } from '@libs/platform/format'
import type { PlatformUserSummary } from '@libs/firebase/types'

export default function PlatformUsersClient({ initialUsers }: { initialUsers: PlatformUserSummary[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) return initialUsers

    return initialUsers.filter(
      user =>
        user.email.toLowerCase().includes(normalized) ||
        user.displayName.toLowerCase().includes(normalized) ||
        user.uid.toLowerCase().includes(normalized)
    )
  }, [initialUsers, query])

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Users'
        subtitle='Every Firebase user account and their workspace memberships across the platform.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Users' }
        ]}
      />

      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        <Chip label={`${initialUsers.length} users`} variant='tonal' />
        <Chip label={`${initialUsers.filter(u => u.isPlatformAdmin).length} platform admins`} color='primary' variant='tonal' />
        <Chip label={`${initialUsers.filter(u => u.membershipCount > 1).length} multi-tenant`} variant='outlined' />
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <CustomTextField
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search by name, email, or UID…'
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
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Active tenant</TableCell>
                  <TableCell>Memberships</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.uid} hover>
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: '0.85rem' }}>
                          {tenantInitials(user.displayName || user.email)}
                        </Avatar>
                        <Box>
                          <Typography className='font-medium'>{user.displayName || '—'}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {user.activeTenantId ? (
                        <Link href={`/platform/tenants/${user.activeTenantId}`} className='no-underline'>
                          <Typography variant='body2' color='primary.main'>
                            {user.activeTenantId}
                          </Typography>
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{user.membershipCount}</TableCell>
                    <TableCell>
                      {user.isPlatformAdmin && <Chip size='small' label='Platform admin' color='primary' variant='tonal' />}
                    </TableCell>
                    <TableCell>{formatPlatformDate(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
