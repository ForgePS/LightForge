'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import TenantModulesPanel from '@components/platform/TenantModulesPanel'
import TenantSettingsPanel from '@components/platform/TenantSettingsPanel'
import TenantUsagePanel from '@components/platform/TenantUsagePanel'
import CustomTextField from '@core/components/mui/TextField'
import type { SubscriptionPlanId, SubscriptionStatus, TenantStatus, TenantSubscription } from '@libs/firebase/types'
import { formatUsd } from '@libs/subscriptions/plans'

type TenantDetail = {
  id: string
  name: string
  slug: string
  status: TenantStatus
  isTemplate: boolean
  archivedAt?: string | null
  subscription: TenantSubscription
  members: Array<{
    uid: string
    email: string
    displayName: string
    role: string
    joinedAt: string | null
  }>
}

export default function TenantAdminDetail({ tenant }: { tenant: TenantDetail }) {
  const router = useRouter()
  const [tab, setTab] = useState(0)
  const [name, setName] = useState(tenant.name)
  const [slug, setSlug] = useState(tenant.slug)
  const [status, setStatus] = useState<TenantStatus>(tenant.status)
  const [isTemplate, setIsTemplate] = useState(tenant.isTemplate)
  const [subscription, setSubscription] = useState<TenantSubscription>(tenant.subscription)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const saveTenant = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, status, isTemplate })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save tenant')
      setMessage('Tenant updated')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save tenant')
    } finally {
      setLoading(false)
    }
  }

  const saveSubscription = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save subscription')
      setMessage('Subscription updated')
      if (data.tenant?.subscription) setSubscription(data.tenant.subscription)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

      <Card>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant='scrollable'>
          <Tab label='Workspace' icon={<i className='tabler-building' />} iconPosition='start' />
          <Tab label='Subscription' icon={<i className='tabler-credit-card' />} iconPosition='start' />
          <Tab label='Members' icon={<i className='tabler-users' />} iconPosition='start' />
          <Tab label='Modules' icon={<i className='tabler-toggle-left' />} iconPosition='start' />
          <Tab label='Usage' icon={<i className='tabler-chart-bar' />} iconPosition='start' />
          <Tab label='Settings' icon={<i className='tabler-settings' />} iconPosition='start' />
        </Tabs>
        <Divider />

        <CardContent>
          {tab === 0 && (
            <Stack spacing={3}>
              <Typography variant='h6'>Workspace settings</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField label='Name' value={name} onChange={e => setName(e.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField label='Slug' value={slug} onChange={e => setSlug(e.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField select label='Status' value={status} onChange={e => setStatus(e.target.value as TenantStatus)} fullWidth>
                    <MenuItem value='trial'>trial</MenuItem>
                    <MenuItem value='active'>active</MenuItem>
                    <MenuItem value='suspended'>suspended</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    select
                    label='Template'
                    value={isTemplate ? 'yes' : 'no'}
                    onChange={e => setIsTemplate(e.target.value === 'yes')}
                    fullWidth
                  >
                    <MenuItem value='no'>No</MenuItem>
                    <MenuItem value='yes'>Yes</MenuItem>
                  </CustomTextField>
                </Grid>
              </Grid>
              <Stack direction='row' spacing={2}>
                <Button variant='contained' onClick={saveTenant} disabled={loading}>
                  Save workspace
                </Button>
                <Button
                  variant='outlined'
                  color={tenant.archivedAt ? 'success' : 'warning'}
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true)
                    setError(null)
                    setMessage(null)

                    try {
                      const res = await fetch(`/api/platform/tenants/${tenant.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ archived: !tenant.archivedAt })
                      })
                      const data = await res.json()

                      if (!res.ok) throw new Error(data.error || 'Unable to update archive state')
                      setMessage(tenant.archivedAt ? 'Tenant restored' : 'Tenant archived')
                      router.refresh()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Unable to update archive state')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  {tenant.archivedAt ? 'Restore from archive' : 'Archive tenant'}
                </Button>
              </Stack>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={3}>
              <Typography variant='h6'>Subscription & billing</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    select
                    label='Plan'
                    value={subscription.planId}
                    onChange={e => setSubscription(prev => ({ ...prev, planId: e.target.value as SubscriptionPlanId }))}
                    fullWidth
                  >
                    <MenuItem value='trial'>trial</MenuItem>
                    <MenuItem value='starter'>starter</MenuItem>
                    <MenuItem value='professional'>professional</MenuItem>
                    <MenuItem value='enterprise'>enterprise</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    select
                    label='Subscription status'
                    value={subscription.status}
                    onChange={e => setSubscription(prev => ({ ...prev, status: e.target.value as SubscriptionStatus }))}
                    fullWidth
                  >
                    <MenuItem value='trialing'>trialing</MenuItem>
                    <MenuItem value='active'>active</MenuItem>
                    <MenuItem value='past_due'>past_due</MenuItem>
                    <MenuItem value='canceled'>canceled</MenuItem>
                    <MenuItem value='paused'>paused</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    select
                    label='Billing interval'
                    value={subscription.billingInterval}
                    onChange={e =>
                      setSubscription(prev => ({
                        ...prev,
                        billingInterval: e.target.value as TenantSubscription['billingInterval']
                      }))
                    }
                    fullWidth
                  >
                    <MenuItem value='month'>month</MenuItem>
                    <MenuItem value='year'>year</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    label='Seats'
                    type='number'
                    value={subscription.seats}
                    onChange={e => setSubscription(prev => ({ ...prev, seats: Number(e.target.value) || 0 }))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    label='Price (cents)'
                    type='number'
                    value={subscription.priceCents ?? 0}
                    onChange={e =>
                      setSubscription(prev => ({
                        ...prev,
                        priceCents: Number(e.target.value) || 0
                      }))
                    }
                    helperText={`Display: ${formatUsd(subscription.priceCents || 0)}`}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    label='Current period end (ISO)'
                    value={subscription.currentPeriodEnd || ''}
                    onChange={e => setSubscription(prev => ({ ...prev, currentPeriodEnd: e.target.value || null }))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    label='Trial ends at (ISO)'
                    value={subscription.trialEndsAt || ''}
                    onChange={e => setSubscription(prev => ({ ...prev, trialEndsAt: e.target.value || null }))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    select
                    label='Cancel at period end'
                    value={subscription.cancelAtPeriodEnd ? 'yes' : 'no'}
                    onChange={e => setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: e.target.value === 'yes' }))}
                    fullWidth
                  >
                    <MenuItem value='no'>No</MenuItem>
                    <MenuItem value='yes'>Yes</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    label='Stripe customer ID'
                    value={subscription.stripeCustomerId || ''}
                    onChange={e => setSubscription(prev => ({ ...prev, stripeCustomerId: e.target.value || null }))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    label='Stripe subscription ID'
                    value={subscription.stripeSubscriptionId || ''}
                    onChange={e => setSubscription(prev => ({ ...prev, stripeSubscriptionId: e.target.value || null }))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    label='Notes'
                    value={subscription.notes}
                    onChange={e => setSubscription(prev => ({ ...prev, notes: e.target.value }))}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Button variant='contained' onClick={saveSubscription} disabled={loading} className='self-start'>
                Save subscription
              </Button>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={3}>
              <Typography variant='h6'>Team members</Typography>
              <Box className='overflow-x-auto'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenant.members.map(member => (
                      <TableRow key={member.uid}>
                        <TableCell>{member.displayName}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <CustomTextField
                            select
                            size='small'
                            value={member.role}
                            onChange={async e => {
                              setLoading(true)
                              setError(null)
                              setMessage(null)

                              try {
                                const res = await fetch(`/api/platform/tenants/${tenant.id}/members`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ uid: member.uid, role: e.target.value })
                                })
                                const data = await res.json()

                                if (!res.ok) throw new Error(data.error || 'Unable to update role')
                                setMessage('Member role updated')
                                router.refresh()
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Unable to update role')
                              } finally {
                                setLoading(false)
                              }
                            }}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value='owner'>owner</MenuItem>
                            <MenuItem value='admin'>admin</MenuItem>
                            <MenuItem value='member'>member</MenuItem>
                          </CustomTextField>
                        </TableCell>
                        <TableCell align='right'>
                          <Button
                            size='small'
                            color='error'
                            disabled={loading}
                            onClick={async () => {
                              setLoading(true)
                              setError(null)
                              setMessage(null)

                              try {
                                const res = await fetch(`/api/platform/tenants/${tenant.id}/members`, {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ uid: member.uid })
                                })
                                const data = await res.json()

                                if (!res.ok) throw new Error(data.error || 'Unable to remove member')
                                setMessage('Member removed')
                                router.refresh()
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Unable to remove member')
                              } finally {
                                setLoading(false)
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Divider />

              <Typography variant='subtitle1'>Invite member</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label='Email'
                    type='email'
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label='Display name'
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    select
                    label='Role'
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value='owner'>owner</MenuItem>
                    <MenuItem value='admin'>admin</MenuItem>
                    <MenuItem value='member'>member</MenuItem>
                  </CustomTextField>
                </Grid>
              </Grid>
              <Button
                variant='contained'
                disabled={loading || !inviteEmail.trim()}
                onClick={async () => {
                  setLoading(true)
                  setError(null)
                  setMessage(null)

                  try {
                    const res = await fetch(`/api/platform/tenants/${tenant.id}/members`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: inviteEmail.trim(),
                        displayName: inviteName.trim() || inviteEmail.trim(),
                        role: inviteRole
                      })
                    })
                    const data = await res.json()

                    if (!res.ok) throw new Error(data.error || 'Unable to invite member')
                    setInviteEmail('')
                    setInviteName('')
                    setInviteRole('member')
                    setMessage('Member invited')
                    router.refresh()
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Unable to invite member')
                  } finally {
                    setLoading(false)
                  }
                }}
                className='self-start'
              >
                Send invite
              </Button>
            </Stack>
          )}
          {tab === 3 && <TenantModulesPanel tenantId={tenant.id} />}

          {tab === 4 && <TenantUsagePanel tenantId={tenant.id} />}

          {tab === 5 && <TenantSettingsPanel tenantId={tenant.id} />}
        </CardContent>
      </Card>
    </Stack>
  )
}
