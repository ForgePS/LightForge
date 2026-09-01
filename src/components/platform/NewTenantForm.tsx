'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import type { TenantStatus } from '@libs/firebase/types'

export default function NewTenantForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<TenantStatus>('active')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [ownerDisplayName, setOwnerDisplayName] = useState('')
  const [isTemplate, setIsTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/platform/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          status,
          isTemplate,
          ownerEmail: ownerEmail || undefined,
          ownerPassword: ownerPassword || undefined,
          ownerDisplayName: ownerDisplayName || undefined
        })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to create tenant')
      }

      router.push(`/platform/tenants/${data.tenant.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant='h5'>Create tenant</Typography>
            {error && <Alert severity='error'>{error}</Alert>}
            <CustomTextField label='Company name' value={name} onChange={e => setName(e.target.value)} required fullWidth />
            <CustomTextField label='Slug (optional)' value={slug} onChange={e => setSlug(e.target.value)} fullWidth />
            <CustomTextField select label='Status' value={status} onChange={e => setStatus(e.target.value as TenantStatus)} fullWidth>
              <MenuItem value='trial'>trial</MenuItem>
              <MenuItem value='active'>active</MenuItem>
              <MenuItem value='suspended'>suspended</MenuItem>
            </CustomTextField>
            <CustomTextField
              select
              label='Template tenant'
              value={isTemplate ? 'yes' : 'no'}
              onChange={e => setIsTemplate(e.target.value === 'yes')}
              fullWidth
            >
              <MenuItem value='no'>No</MenuItem>
              <MenuItem value='yes'>Yes</MenuItem>
            </CustomTextField>
            <Typography variant='subtitle2'>Optional owner account</Typography>
            <CustomTextField label='Owner name' value={ownerDisplayName} onChange={e => setOwnerDisplayName(e.target.value)} fullWidth />
            <CustomTextField label='Owner email' type='email' value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} fullWidth />
            <CustomTextField
              label='Owner password'
              type='password'
              value={ownerPassword}
              onChange={e => setOwnerPassword(e.target.value)}
              fullWidth
            />
            <Button type='submit' variant='contained' disabled={loading || !name.trim()}>
              {loading ? 'Creating…' : 'Create tenant'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
