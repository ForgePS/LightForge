'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'

import CustomTextField from '@core/components/mui/TextField'
import { DEFAULT_PORTAL_FEATURE_SETTINGS } from '@libs/customer-portal/settings-shared'
import type { CustomerPortalFeatureSettings } from '@libs/customer-portal/types'

const featureToggles: Array<{ key: keyof CustomerPortalFeatureSettings; label: string }> = [
  { key: 'myLighting', label: 'My Lighting' },
  { key: 'photos', label: 'Photos' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'serviceRequests', label: 'Service Requests' },
  { key: 'proposals', label: 'Proposals' },
  { key: 'onlinePayments', label: 'Online Payments' },
  { key: 'agreements', label: 'Agreements' },
  { key: 'messages', label: 'Messages' },
  { key: 'propertyInformation', label: 'Property Information' },
  { key: 'seasonalRenewal', label: 'Seasonal Renewal' },
  { key: 'addOnRequests', label: 'Add-On Requests' },
  { key: 'multipleProperties', label: 'Multiple Properties' },
  { key: 'customerFileUploads', label: 'Customer File Uploads' },
  { key: 'referrals', label: 'Referrals' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'technicianArrivalStatus', label: 'Technician Arrival Status' },
  { key: 'savedPaymentMethods', label: 'Saved Payment Methods (stub)' },
  { key: 'autopay', label: 'Autopay Consent' },
  { key: 'showPoweredBy', label: 'Show “Powered by LightForge”' }
]

export default function CustomerPortalSettingsSection() {
  const [settings, setSettings] = useState<CustomerPortalFeatureSettings>(DEFAULT_PORTAL_FEATURE_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tenants/current/customer-portal-settings')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.settings) setSettings(data.settings)
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/tenants/current/customer-portal-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save')
      setSettings(data.settings)
      setMessage('Customer Portal settings saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant='h6'>Customer Portal</Typography>
            <Typography variant='body2' color='text.secondary'>
              Mobile customer experience for QR codes, schedules, service requests, and more. Defaults to off until you
              enable it.
            </Typography>
          </div>

          {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={e => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              />
            }
            label='Enable Customer Portal for this workspace'
          />

          <CustomTextField
            fullWidth
            label='Portal display name'
            value={settings.portalDisplayName || ''}
            onChange={e => setSettings(prev => ({ ...prev, portalDisplayName: e.target.value || null }))}
          />
          <CustomTextField
            fullWidth
            label='Support phone'
            value={settings.supportPhone || ''}
            onChange={e => setSettings(prev => ({ ...prev, supportPhone: e.target.value || null }))}
          />
          <CustomTextField
            fullWidth
            label='Renewal button label'
            value={settings.renewalLabel || ''}
            onChange={e => setSettings(prev => ({ ...prev, renewalLabel: e.target.value || null }))}
            helperText='Example for Yuletide: Rebook for Next Season'
          />
          <CustomTextField
            fullWidth
            label='Removal label'
            value={settings.removalLabel || ''}
            onChange={e => setSettings(prev => ({ ...prev, removalLabel: e.target.value || null }))}
            helperText='Example for Yuletide: Takedown'
          />

          <Divider />
          <Typography variant='subtitle2'>Features</Typography>
          <Stack>
            {featureToggles.map(toggle => (
              <FormControlLabel
                key={String(toggle.key)}
                control={
                  <Switch
                    checked={Boolean(settings[toggle.key])}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        [toggle.key]: e.target.checked
                      }))
                    }
                  />
                }
                label={toggle.label}
              />
            ))}
          </Stack>

          <Button variant='contained' className='self-start' onClick={save} disabled={loading}>
            {loading ? 'Saving…' : 'Save portal settings'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
