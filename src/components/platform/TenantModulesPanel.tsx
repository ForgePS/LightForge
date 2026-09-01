'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import { MODULES } from '@libs/modules/registry'

export default function TenantModulesPanel({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/platform/tenants/${tenantId}/modules`)
      .then(res => res.json())
      .then(data => {
        if (!data.ok) throw new Error(data.error || 'Unable to load modules')
        setEnabled(data.enabled || [])
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load modules'))
      .finally(() => setLoading(false))
  }, [tenantId])

  const enabledSet = useMemo(() => new Set(enabled), [enabled])
  const enabledCount = enabled.length
  const totalCount = MODULES.length

  const persist = async (nextEnabled: string[], successMessage: string) => {
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save modules')
      setEnabled(data.enabled || [])
      setMessage(successMessage)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save modules')
    } finally {
      setSaving(false)
    }
  }

  const toggleModule = (moduleKey: string, active: boolean) => {
    const next = active ? [...enabledSet, moduleKey] : [...enabledSet].filter(key => key !== moduleKey)

    void persist(next, active ? 'Module activated' : 'Module deactivated')
  }

  if (loading) {
    return <Typography color='text.secondary'>Loading modules…</Typography>
  }

  return (
    <Stack spacing={3}>
      <Typography color='text.secondary'>
        Control which product modules this tenant can access. Disabled modules are hidden from the tenant navigation and
        blocked from API access.
      </Typography>

      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}

      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap alignItems='center'>
        <Chip label={`${enabledCount} of ${totalCount} active`} color='primary' variant='tonal' />
        <Button
          variant='contained'
          disabled={saving || enabledCount === totalCount}
          onClick={() => void persist(MODULES.map(module => module.key), 'All modules activated')}
        >
          Activate all modules
        </Button>
        <Button
          variant='outlined'
          color='warning'
          disabled={saving || enabledCount === 0}
          onClick={() => void persist([], 'All modules deactivated')}
        >
          Deactivate all
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {MODULES.map(module => {
          const active = enabledSet.has(module.key)

          return (
            <Grid key={module.key} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card variant='outlined' className={active ? 'border-primary' : ''}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction='row' justifyContent='space-between' alignItems='flex-start' gap={1}>
                      <Box>
                        <Typography variant='subtitle1' className='font-medium'>
                          {module.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {module.href}
                        </Typography>
                      </Box>
                      <Chip size='small' label={active ? 'Active' : 'Off'} color={active ? 'success' : 'default'} variant='tonal' />
                    </Stack>
                    <Typography variant='body2' color='text.secondary'>
                      {module.description}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={active}
                          disabled={saving}
                          onChange={e => toggleModule(module.key, e.target.checked)}
                        />
                      }
                      label={active ? 'Enabled for tenant' : 'Disabled for tenant'}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Stack>
  )
}
