'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import { PlatformPageHeader, formatPlatformDate } from '@components/platform/platformUi'
import type { PlatformAdminRecord } from '@libs/firebase/types'

export default function PlatformAdminsClient({
  initialAdmins,
  currentUid
}: {
  initialAdmins: PlatformAdminRecord[]
  currentUid: string
}) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initialAdmins)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const grant = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/platform/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to grant admin')
      setAdmins(data.admins)
      setEmail('')
      setMessage('Platform admin access granted')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to grant admin')
    } finally {
      setLoading(false)
    }
  }

  const revoke = async (uid: string) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/platform/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to revoke admin')
      setAdmins(data.admins)
      setMessage('Platform admin access revoked')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to revoke admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Platform admins'
        subtitle='Users who can access this control center and manage all tenants.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Platform admins' }
        ]}
      />

      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>Grant access</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <CustomTextField
                label='User email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                helperText='User must already exist in Firebase Auth'
                fullWidth
              />
              <Button variant='contained' disabled={loading || !email.trim()} onClick={grant} sx={{ minWidth: 160, alignSelf: { md: 'flex-end' } }}>
                Grant admin
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>UID</TableCell>
                <TableCell>Granted</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin.uid}>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Typography variant='caption'>{admin.uid}</Typography>
                  </TableCell>
                  <TableCell>{formatPlatformDate(admin.createdAt)}</TableCell>
                  <TableCell align='right'>
                    <Button
                      size='small'
                      color='error'
                      disabled={loading || admin.uid === currentUid}
                      onClick={() => revoke(admin.uid)}
                    >
                      Revoke
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
