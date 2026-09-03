'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import CustomTextField from '@core/components/mui/TextField'

export default function PortalVerificationPanel({
  purpose,
  onVerified
}: {
  purpose: 'signature' | 'documents' | 'step_up' | 'payment'
  onVerified?: () => void
}) {
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const [destinationMasked, setDestinationMasked] = useState<string | null>(null)
  const [debugCode, setDebugCode] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const send = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/customer-portal/verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to send code')
      setVerificationId(data.verificationId)
      setDestinationMasked(data.destinationMasked)
      setDebugCode(data.debugCode || null)
      setMessage(`Code sent to ${data.destinationMasked}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send code')
    } finally {
      setLoading(false)
    }
  }

  const confirm = async () => {
    if (!verificationId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/customer-portal/verification/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, code })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to verify')
      setMessage('Verified. You can continue.')
      onVerified?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant='h6'>Verify it&apos;s you</Typography>
          <Typography variant='body2' color='text.secondary'>
            Sensitive actions require a one-time code sent to the contact on your account
            {destinationMasked ? ` (${destinationMasked})` : ''}.
          </Typography>
          {(error || message) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}
          {debugCode && (
            <Alert severity='info'>Dev code: {debugCode}</Alert>
          )}
          {!verificationId ? (
            <Button variant='contained' onClick={send} disabled={loading}>
              {loading ? 'Sending…' : 'Send one-time code'}
            </Button>
          ) : (
            <>
              <CustomTextField
                fullWidth
                label='6-digit code'
                value={code}
                onChange={e => setCode(e.target.value)}
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              />
              <Stack direction='row' gap={1}>
                <Button variant='contained' onClick={confirm} disabled={loading || code.trim().length < 6}>
                  {loading ? 'Checking…' : 'Confirm code'}
                </Button>
                <Button variant='text' onClick={send} disabled={loading}>
                  Resend
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
