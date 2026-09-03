'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Rating from '@mui/material/Rating'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'
import PortalVerificationPanel from '@components/customer-portal/PortalVerificationPanel'

type AccountPayload = {
  features: {
    referrals: boolean
    reviews: boolean
    technicianArrival: boolean
    savedPaymentMethods: boolean
    autopay: boolean
  }
  reviews: Array<{ id: string; rating: number; notes: string | null }>
  referrals: Array<{ id: string; friendName: string | null; status: string }>
  arrivals: Array<{ jobTitle: string; crewFirstName: string | null; etaWindow: string | null; weatherNotice: string | null }>
  weatherNotices: Array<{ title: string; notice: string; date: string | null }>
  billingPreferences: {
    savedPaymentMethodOnFile: boolean
    autopayEnabled: boolean
    autopayConsentAt: string | null
  }
  properties: Array<{ id: string; name: string; address: string; selected: boolean }>
  canSwitch: boolean
}

export default function PortalAccountClient({
  initial,
  error
}: {
  initial: AccountPayload | null
  error?: string
}) {
  const [data, setData] = useState(initial)
  const [rating, setRating] = useState<number | null>(5)
  const [reviewNotes, setReviewNotes] = useState('')
  const [friendName, setFriendName] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsStepUp, setNeedsStepUp] = useState(false)
  const [autopayConsent, setAutopayConsent] = useState(false)

  if (error || !data) {
    return (
      <PortalShell title='Account'>
        <Alert severity='warning'>{error || 'Unable to load account'}</Alert>
      </PortalShell>
    )
  }

  const run = async (action: string, body: Record<string, unknown>) => {
    setLoading(true)
    setFormError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/customer-portal/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body })
      })
      const json = await res.json()

      if (res.status === 403 && json.code === 'STEP_UP_REQUIRED') {
        setNeedsStepUp(true)
        setFormError('Verify with a one-time code first.')
        return
      }

      if (!res.ok) throw new Error(json.error || 'Request failed')

      if (action === 'autopay') {
        setData(prev =>
          prev
            ? {
                ...prev,
                billingPreferences: json.billingPreferences,
                features: json.features,
                reviews: json.reviews,
                referrals: json.referrals,
                arrivals: json.arrivals,
                weatherNotices: json.weatherNotices
              }
            : prev
        )
        setMessage(body.enabled ? 'Autopay preference saved' : 'Autopay turned off')
      } else {
        setMessage('Saved')
        const refresh = await fetch('/api/customer-portal/account')
        const refreshed = await refresh.json()

        if (refresh.ok) {
          setData(prev => ({
            ...(prev as AccountPayload),
            ...refreshed,
            properties: prev?.properties || [],
            canSwitch: prev?.canSwitch || false
          }))
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const switchProperty = async (propertyId: string) => {
    setLoading(true)
    setFormError(null)

    try {
      const res = await fetch('/api/customer-portal/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Unable to switch property')
      setData(prev => (prev ? { ...prev, properties: json.properties, canSwitch: json.canSwitch } : prev))
      setMessage('Property selected')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to switch property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalShell title='Account' subtitle='Properties, reviews, referrals, and preferences'>
      {(formError || message) && <Alert severity={formError ? 'error' : 'success'}>{formError || message}</Alert>}

      {data.weatherNotices.length > 0 && (
        <Alert severity='warning'>
          {data.weatherNotices.map(item => `${item.title}: ${item.notice}`).join(' · ')}
        </Alert>
      )}

      {data.arrivals.length > 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant='h6' className='mbe-1'>
              Technician updates
            </Typography>
            {data.arrivals.map((item, index) => (
              <Typography key={`${item.jobTitle}-${index}`}>
                {item.jobTitle}
                {item.crewFirstName ? ` · ${item.crewFirstName} en route` : ' · Technician en route'}
                {item.etaWindow ? ` · ${item.etaWindow}` : ''}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {data.canSwitch && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Service properties</Typography>
              <CustomTextField
                select
                fullWidth
                label='Active property'
                value={data.properties.find(p => p.selected)?.id || ''}
                onChange={e => void switchProperty(e.target.value)}
              >
                {data.properties.map(property => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name} — {property.address}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Stack>
          </CardContent>
        </Card>
      )}

      {data.features.reviews && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Leave a review</Typography>
              <Rating value={rating} onChange={(_e, value) => setRating(value)} />
              <CustomTextField
                fullWidth
                multiline
                minRows={2}
                label='Comments'
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
              />
              <Button
                variant='contained'
                disabled={loading || !rating}
                onClick={() => run('review', { rating, notes: reviewNotes })}
              >
                Submit review
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {data.features.referrals && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Refer a friend</Typography>
              <CustomTextField
                fullWidth
                label="Friend's name"
                value={friendName}
                onChange={e => setFriendName(e.target.value)}
              />
              <CustomTextField
                fullWidth
                label="Friend's email"
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
              />
              <Button
                variant='outlined'
                disabled={loading || friendName.trim().length < 2}
                onClick={() => run('referral', { friendName, friendEmail })}
              >
                Send referral
              </Button>
              {data.referrals.length > 0 && (
                <Typography variant='body2' color='text.secondary'>
                  {data.referrals.length} referral(s) on file
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {data.features.autopay && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Autopay</Typography>
              <Typography variant='body2' color='text.secondary'>
                Autopay uses processor tokens only. You can revoke anytime. Card capture for saved methods is enabled
                when your contractor completes Stripe payment-method setup.
              </Typography>
              {needsStepUp && <PortalVerificationPanel purpose='payment' onVerified={() => setNeedsStepUp(false)} />}
              <FormControlLabel
                control={<Checkbox checked={autopayConsent} onChange={e => setAutopayConsent(e.target.checked)} />}
                label='I consent to automatic payment of open invoices on the due date'
              />
              <Stack direction='row' gap={1}>
                <Button
                  variant='contained'
                  disabled={loading || !autopayConsent}
                  onClick={() => run('autopay', { enabled: true, consent: true })}
                >
                  Enable autopay
                </Button>
                <Button
                  variant='text'
                  disabled={loading || !data.billingPreferences.autopayEnabled}
                  onClick={() => run('autopay', { enabled: false, consent: true })}
                >
                  Turn off
                </Button>
              </Stack>
              {data.billingPreferences.autopayEnabled && (
                <Alert severity='success'>Autopay is on for this account.</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Button href='/portal/property' variant='outlined'>
        Property details
      </Button>
      <Button href='/portal/sign-out' variant='text'>
        Sign out
      </Button>
    </PortalShell>
  )
}
