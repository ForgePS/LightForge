'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'
import type { PortalPropertyDto } from '@libs/customer-portal/types'

const EDITABLE = [
  { field: 'petNotice', label: 'Pet notice', immediate: true },
  { field: 'preferredArrival', label: 'Preferred arrival', immediate: true },
  { field: 'storagePreference', label: 'Storage preference', immediate: true },
  { field: 'customerAccessInstructions', label: 'Access instructions', immediate: false },
  { field: 'gateInfo', label: 'Gate information', immediate: false }
] as const

export default function PortalPropertyClient({
  property,
  pendingChanges,
  error
}: {
  property: PortalPropertyDto | null
  pendingChanges: Array<{ field: string; requestedValue: string; createdAt: string | null }>
  error?: string
}) {
  const [field, setField] = useState<string>(EDITABLE[0].field)
  const [value, setValue] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (error || !property) {
    return (
      <PortalShell title='My Property'>
        <Alert severity='warning'>{error || 'Unable to load property'}</Alert>
      </PortalShell>
    )
  }

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    setFormError(null)

    try {
      const res = await fetch('/api/customer-portal/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save')
      setMessage(
        data.status === 'updated'
          ? 'Preference updated'
          : 'Change submitted for office review'
      )
      setValue('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalShell title='My Property' subtitle={property.nickname || property.name || undefined}>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography fontWeight={700}>{property.nickname || property.name || 'Service property'}</Typography>
            <Typography color='text.secondary'>
              {[property.address, property.city, property.state, property.zip].filter(Boolean).join(', ')}
            </Typography>
            {property.primaryContact && (
              <Typography variant='body2'>Contact: {property.primaryContact}</Typography>
            )}
            {property.accessInstructions && (
              <Typography variant='body2'>Access: {property.accessInstructions}</Typography>
            )}
            {property.gateInfo && <Typography variant='body2'>Gate: {property.gateInfo}</Typography>}
            {property.powerSourceSummary && (
              <Typography variant='body2'>Power: {property.powerSourceSummary}</Typography>
            )}
            {property.timerLocation && <Typography variant='body2'>Timer: {property.timerLocation}</Typography>}
            {property.petNotice && <Typography variant='body2'>Pets: {property.petNotice}</Typography>}
            {property.preferredArrival && (
              <Typography variant='body2'>Arrival: {property.preferredArrival}</Typography>
            )}
            {property.storagePreference && (
              <Typography variant='body2'>Storage: {property.storagePreference}</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {(message || formError) && <Alert severity={formError ? 'error' : 'success'}>{formError || message}</Alert>}

      {pendingChanges.length > 0 && (
        <Alert severity='info'>
          Pending review: {pendingChanges.map(change => change.field).join(', ')}
        </Alert>
      )}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>Update a preference</Typography>
            <CustomTextField select fullWidth label='Field' value={field} onChange={e => setField(e.target.value)}>
              {EDITABLE.map(item => (
                <MenuItem key={item.field} value={item.field}>
                  {item.label}
                  {item.immediate ? '' : ' (requires review)'}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              fullWidth
              label='New value'
              value={value}
              onChange={e => setValue(e.target.value)}
              multiline
              minRows={2}
            />
            <Button variant='contained' disabled={loading || !value.trim()} onClick={submit}>
              {loading ? 'Saving…' : 'Submit'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PortalShell>
  )
}
