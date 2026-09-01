'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

export default function TenantSettingsPanel({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const [settingsJson, setSettingsJson] = useState('{}')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/platform/tenants/${tenantId}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) setSettingsJson(JSON.stringify(data.settings || {}, null, 2))
      })
      .catch(() => setError('Unable to load tenant settings'))
  }, [tenantId])

  const save = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const parsed = JSON.parse(settingsJson)
      const res = await fetch(`/api/platform/tenants/${tenantId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save settings')
      setSettingsJson(JSON.stringify(data.settings || {}, null, 2))
      setMessage('Tenant settings saved')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Typography color='text.secondary'>
        Raw `settings/general` document for this tenant. Same data editable in the tenant app under Settings.
      </Typography>
      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}
      <CustomTextField
        value={settingsJson}
        onChange={e => setSettingsJson(e.target.value)}
        multiline
        minRows={16}
        fullWidth
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
      />
      <Button variant='contained' disabled={loading} onClick={save} className='self-start'>
        Save tenant settings
      </Button>
    </Stack>
  )
}
