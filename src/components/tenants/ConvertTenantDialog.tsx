'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'

export default function ConvertTenantDialog({ defaultName }: { defaultName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultName)
  const [planId, setPlanId] = useState('starter')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tenants/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, planId })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to convert')
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to convert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant='contained' onClick={() => setOpen(true)}>
        Keep software
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Convert trial to active</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mbs-2'>
            {error && <Alert severity='error'>{error}</Alert>}
            <CustomTextField
              fullWidth
              label='Company name'
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <CustomTextField select fullWidth label='Plan' value={planId} onChange={e => setPlanId(e.target.value)}>
              <MenuItem value='starter'>Starter</MenuItem>
              <MenuItem value='professional'>Professional</MenuItem>
              <MenuItem value='enterprise'>Enterprise</MenuItem>
            </CustomTextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={submit} disabled={loading}>
            {loading ? 'Converting…' : 'Convert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
