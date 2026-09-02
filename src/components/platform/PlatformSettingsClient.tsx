'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import BrandingUploadSection from '@components/branding/BrandingUploadSection'
import { PlatformPageHeader } from '@components/platform/platformUi'
import { DEFAULT_BRANDING, normalizeBranding, type BrandingSettings } from '@libs/branding/types'
import type { PlatformSettings } from '@libs/firebase/types'

export default function PlatformSettingsClient({ initialSettings }: { initialSettings: PlatformSettings }) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [branding, setBranding] = useState<BrandingSettings>(
    normalizeBranding(initialSettings.branding ?? DEFAULT_BRANDING)
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save settings')
      setSettings(data.settings)
      setMessage('Platform settings saved')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Platform settings'
        subtitle='Global configuration for onboarding, support, and maintenance mode.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Settings' }
        ]}
      />

      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>General</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  label='Platform name'
                  value={settings.platformName}
                  onChange={e => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  label='Support email'
                  type='email'
                  value={settings.supportEmail}
                  onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  label='Default trial days'
                  type='number'
                  value={settings.defaultTrialDays}
                  onChange={e => setSettings(prev => ({ ...prev, defaultTrialDays: Number(e.target.value) || 14 }))}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowSelfServeSignup}
                    onChange={e => setSettings(prev => ({ ...prev, allowSelfServeSignup: e.target.checked }))}
                  />
                }
                label='Allow self-serve signup'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={e => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  />
                }
                label='Maintenance mode (blocks new tenant access — wire in middleware later)'
              />
            </Stack>
            <Button variant='contained' disabled={loading} onClick={save} className='self-start'>
              Save settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>Platform branding</Typography>
            <Typography color='text.secondary'>
              Default branding for the platform admin console and onboarding experience.
            </Typography>
            <BrandingUploadSection
              branding={branding}
              uploadUrl='/api/platform/branding'
              disabled={loading}
              onBrandingChange={setBranding}
              onMessage={(msg, err) => {
                setMessage(msg)
                setError(err)
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
