'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import BrandingUploadSection from '@components/branding/BrandingUploadSection'
import CustomTextField from '@core/components/mui/TextField'
import { DEFAULT_BRANDING, normalizeBranding, type BrandingSettings } from '@libs/branding/types'
import type { TenantGeneralSettings } from '@libs/firebase/types'

export default function TenantSettingsPanel({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const [settings, setSettings] = useState<TenantGeneralSettings>({})
  const [branding, setBranding] = useState<BrandingSettings>({ ...DEFAULT_BRANDING })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/platform/tenants/${tenantId}/settings`).then(res => res.json()),
      fetch(`/api/platform/tenants/${tenantId}/branding`).then(res => res.json())
    ])
      .then(([settingsData, brandingData]) => {
        if (settingsData.ok) {
          const general = settingsData.settings || {}

          setSettings({
            companyName: typeof general.companyName === 'string' ? general.companyName : '',
            timezone: typeof general.timezone === 'string' ? general.timezone : 'America/New_York',
            supportEmail: typeof general.supportEmail === 'string' ? general.supportEmail : ''
          })
        }

        if (brandingData.ok) {
          setBranding(normalizeBranding(brandingData.branding))
        }
      })
      .catch(() => setError('Unable to load tenant settings'))
      .finally(() => setLoading(false))
  }, [tenantId])

  const saveGeneral = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save settings')
      setMessage('Tenant settings saved')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Typography color='text.secondary'>Loading tenant settings…</Typography>
  }

  return (
    <Stack spacing={4}>
      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='h6'>Company profile</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Company name'
                  value={settings.companyName || ''}
                  onChange={e => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Timezone'
                  value={settings.timezone || 'America/New_York'}
                  onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Support email'
                  type='email'
                  value={settings.supportEmail || ''}
                  onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Button variant='contained' disabled={saving} onClick={() => void saveGeneral()} className='self-start'>
              Save company profile
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Divider />

      <div>
        <Typography variant='h6' className='mbe-1'>
          Branding
        </Typography>
        <Typography color='text.secondary' className='mbe-4'>
          Upload this tenant&apos;s logo, favicon, and brand colors. These appear in the tenant app and customer-facing
          materials.
        </Typography>
        <BrandingUploadSection
          branding={branding}
          uploadUrl={`/api/platform/tenants/${tenantId}/branding`}
          disabled={saving}
          onBrandingChange={setBranding}
          onMessage={(msg, err) => {
            setMessage(msg)
            setError(err)
          }}
        />
      </div>
    </Stack>
  )
}
