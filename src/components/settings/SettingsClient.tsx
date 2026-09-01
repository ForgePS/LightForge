'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'

import CustomTextField from '@core/components/mui/TextField'
import { useTenant } from '@components/providers/TenantProvider'
import ConvertTenantDialog from '@components/tenants/ConvertTenantDialog'

type Member = { uid: string; email: string; displayName: string; role: string }

export default function SettingsClient({
  initialSettings,
  members
}: {
  initialSettings: Record<string, unknown>
  members: Member[]
}) {
  const { tenant, user } = useTenant()
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)

  const seatLimit = tenant?.seats ?? 0
  const overSeatLimit = seatLimit > 0 && members.length > seatLimit

  const saveSettings = async () => {
    setError(null)
    setMessage(null)

    const res = await fetch('/api/tenants/current/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Unable to save settings')

      return
    }

    setMessage('Settings saved')
    router.refresh()
  }

  const invite = async () => {
    setError(null)
    setMessage(null)

    const res = await fetch('/api/tenants/current/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteEmail,
        displayName: inviteName,
        role: inviteRole
      })
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Unable to invite')

      return
    }

    setInviteEmail('')
    setInviteName('')
    setMessage('Member invited')
    router.refresh()
  }

  const startCheckout = async (planId: string) => {
    setBillingLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Checkout unavailable')
      if (data.url) window.location.href = data.url
      else setMessage(data.message || 'Checkout session created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setBillingLoading(false)
    }
  }

  const openPortal = async () => {
    setBillingLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Portal unavailable')
      if (data.url) window.location.href = data.url
      else setMessage(data.message || 'Portal unavailable in this environment')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portal failed')
    } finally {
      setBillingLoading(false)
    }
  }

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  return (
    <Stack spacing={4}>
      <div>
        <Typography variant='h4'>Settings</Typography>
        <Typography color='text.secondary'>Company profile, team, and billing</Typography>
      </div>

      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

      {overSeatLimit && (
        <Alert severity='warning'>
          This workspace has {members.length} members but the plan includes {seatLimit} seats. Upgrade the plan or remove
          members to stay within limits.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>Company</Typography>
            <CustomTextField
              fullWidth
              label='Company name'
              value={String(settings.companyName || tenant?.name || '')}
              onChange={e => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
            />
            <CustomTextField
              fullWidth
              label='Timezone'
              value={String(settings.timezone || 'America/New_York')}
              onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
            />
            <CustomTextField
              fullWidth
              label='Support email'
              value={String(settings.supportEmail || user.email)}
              onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
            />
            <Button variant='contained' className='self-start' onClick={saveSettings}>
              Save settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>Billing</Typography>
            <Typography variant='body2' color='text.secondary'>
              Plan: {tenant?.planId || '—'} · Status: {tenant?.subscriptionStatus || tenant?.status}
            </Typography>
            <Stack direction='row' gap={2} flexWrap='wrap'>
              {tenant?.status === 'trial' && (tenant.role === 'owner' || tenant.role === 'admin') && (
                <ConvertTenantDialog defaultName={tenant.name} />
              )}
              <Button variant='outlined' disabled={billingLoading} onClick={() => startCheckout('starter')}>
                Upgrade via Stripe
              </Button>
              <Button variant='text' disabled={billingLoading} onClick={openPortal}>
                Customer portal
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>Team</Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.uid}>
                    <TableCell>{member.displayName}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip size='small' label={member.role} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Divider />
            <Typography variant='subtitle2'>Invite member</Typography>
            <CustomTextField fullWidth label='Name' value={inviteName} onChange={e => setInviteName(e.target.value)} />
            <CustomTextField
              fullWidth
              label='Email'
              type='email'
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
            <CustomTextField select fullWidth label='Role' value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              <MenuItem value='member'>member</MenuItem>
              <MenuItem value='admin'>admin</MenuItem>
              <MenuItem value='owner'>owner</MenuItem>
            </CustomTextField>
            <Button variant='contained' className='self-start' onClick={invite} disabled={!inviteEmail}>
              Invite
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
