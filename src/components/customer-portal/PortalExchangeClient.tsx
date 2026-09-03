'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

export default function PortalExchangeClient({
  mode,
  shortCode,
  grantToken,
  message
}: {
  mode: 'exchange' | 'error'
  shortCode: string
  grantToken?: string
  message?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'exchange' || !grantToken) return

    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/customer-portal/access/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shortCode, grantToken })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Unable to open portal')
        if (!cancelled) router.replace(data.redirectTo || '/portal/home')
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to open portal')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [mode, shortCode, grantToken, router])

  if (mode === 'error' || error) {
    return (
      <Stack className='min-bs-screen items-center justify-center p-6' spacing={3} maxWidth={480} mx='auto'>
        <Typography variant='h4' textAlign='center'>
          Customer Portal
        </Typography>
        <Alert severity='warning'>{error || message}</Alert>
        <Button href='/' variant='outlined'>
          Close
        </Button>
      </Stack>
    )
  }

  return (
    <Stack className='min-bs-screen items-center justify-center p-6' spacing={3}>
      <CircularProgress />
      <Typography>Opening your lighting portal…</Typography>
    </Stack>
  )
}
