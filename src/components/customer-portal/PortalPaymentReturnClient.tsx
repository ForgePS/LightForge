'use client'

import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import PortalShell from '@components/customer-portal/PortalShell'

export default function PortalPaymentReturnClient({
  invoiceNumber,
  status,
  sessionId
}: {
  invoiceNumber: string
  status: string | null
  sessionId: string | null
}) {
  const [message, setMessage] = useState('Checking payment status…')
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (status === 'canceled') {
        setMessage('Payment was canceled. No charge was completed.')
        return
      }

      try {
        const params = new URLSearchParams({ invoice: invoiceNumber })

        if (sessionId) params.set('session_id', sessionId)

        const res = await fetch(`/api/customer-portal/payments?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Unable to confirm payment')
        if (cancelled) return

        if (data.paid) {
          setPaid(true)
          setMessage('Payment confirmed. Thank you!')
        } else {
          setMessage(
            'Payment is still processing. If you completed checkout, your invoice will update when Stripe confirms the payment.'
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to confirm payment')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [invoiceNumber, sessionId, status])

  return (
    <PortalShell title='Payment'>
      {error ? <Alert severity='error'>{error}</Alert> : <Alert severity={paid ? 'success' : 'info'}>{message}</Alert>}
      {!error && !paid && status !== 'canceled' && (
        <Stack direction='row' spacing={1} alignItems='center'>
          <CircularProgress size={18} />
          <Typography variant='body2'>Waiting for processor confirmation…</Typography>
        </Stack>
      )}
      <Button href={`/portal/invoices/${encodeURIComponent(invoiceNumber)}`} variant='contained'>
        View invoice
      </Button>
      <Button href='/portal/invoices' variant='outlined'>
        All invoices
      </Button>
    </PortalShell>
  )
}
