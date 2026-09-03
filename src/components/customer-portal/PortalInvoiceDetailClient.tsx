'use client'

import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

import PortalShell from '@components/customer-portal/PortalShell'
import PortalVerificationPanel from '@components/customer-portal/PortalVerificationPanel'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

type InvoiceDetail = {
  publicNumber: string
  title: string | null
  customerStatus: string
  amountCents: number
  amountPaidCents: number
  amountDueCents: number
  dueDate: string | null
  pastDue: boolean
  creditsCents: number
  refundsCents: number
  canPay: boolean
  receiptUrl: string | null
  lineItems: Array<{ name: string; amountCents: number }>
  payments: Array<{
    id: string
    amountCents: number
    status: string
    paidAt: string | null
    receiptUrl: string | null
    methodLabel: string | null
  }>
}

export default function PortalInvoiceDetailClient({
  initial,
  error
}: {
  initial: InvoiceDetail | null
  error?: string
}) {
  const [invoice, setInvoice] = useState(initial)
  const [verified, setVerified] = useState(false)
  const [needsStepUp, setNeedsStepUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

  if (error || !invoice) {
    return (
      <PortalShell title='Invoice'>
        <Alert severity='warning'>{error || 'Invoice not found'}</Alert>
        <Button href='/portal/invoices' variant='outlined'>
          Back to invoices
        </Button>
      </PortalShell>
    )
  }

  const startPayment = async () => {
    setLoading(true)
    setFormError(null)

    try {
      const res = await fetch('/api/customer-portal/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicNumber: invoice.publicNumber, idempotencyKey })
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'STEP_UP_REQUIRED') {
        setNeedsStepUp(true)
        setFormError('Verify with a one-time code before paying.')
        return
      }

      if (!res.ok) throw new Error(data.error || 'Unable to start payment')

      if (data.status === 'already_paid') {
        setInvoice(prev => (prev ? { ...prev, amountDueCents: 0, customerStatus: 'Paid', canPay: false } : prev))
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      throw new Error('Payment session was not created')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to start payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalShell title={invoice.publicNumber} subtitle={invoice.title || undefined}>
      <Chip
        label={invoice.customerStatus}
        color={invoice.pastDue ? 'error' : invoice.amountDueCents === 0 ? 'success' : 'primary'}
        sx={{ alignSelf: 'flex-start' }}
      />

      {(formError) && <Alert severity='error'>{formError}</Alert>}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant='h5'>{money(invoice.amountDueCents)} due</Typography>
            <Typography color='text.secondary'>Invoice total {money(invoice.amountCents)}</Typography>
            {invoice.amountPaidCents > 0 && (
              <Typography color='text.secondary'>Paid to date {money(invoice.amountPaidCents)}</Typography>
            )}
            {invoice.creditsCents > 0 && (
              <Typography color='text.secondary'>Credits {money(invoice.creditsCents)}</Typography>
            )}
            {invoice.refundsCents > 0 && (
              <Typography color='text.secondary'>Refunds {money(invoice.refundsCents)}</Typography>
            )}
            {invoice.dueDate && (
              <Typography color={invoice.pastDue ? 'error' : 'text.secondary'}>Due {invoice.dueDate}</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant='h6' className='mbe-2'>
            Line items
          </Typography>
          <Stack spacing={1} divider={<Divider flexItem />}>
            {invoice.lineItems.map((item, index) => (
              <Stack key={`${item.name}-${index}`} direction='row' justifyContent='space-between' gap={1}>
                <Typography>{item.name}</Typography>
                <Typography>{money(item.amountCents)}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {invoice.payments.length > 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant='h6' className='mbe-2'>
              Payment history
            </Typography>
            <Stack spacing={1.5}>
              {invoice.payments.map(payment => (
                <Stack key={payment.id} spacing={0.5}>
                  <Stack direction='row' justifyContent='space-between' gap={1}>
                    <Typography fontWeight={600}>{money(payment.amountCents)}</Typography>
                    <Chip size='small' label={payment.status} />
                  </Stack>
                  <Typography variant='body2' color='text.secondary'>
                    {[payment.methodLabel, payment.paidAt].filter(Boolean).join(' · ')}
                  </Typography>
                  {payment.receiptUrl && (
                    <Button href={payment.receiptUrl} target='_blank' size='small' sx={{ alignSelf: 'flex-start' }}>
                      Receipt
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {invoice.canPay && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Pay securely</Typography>
              <Typography variant='body2' color='text.secondary'>
                Card details are handled by Stripe. LightForge never stores full card numbers. Payment is confirmed by
                webhook, not by the browser return page alone.
              </Typography>
              {(needsStepUp || !verified) && (
                <PortalVerificationPanel
                  purpose='payment'
                  onVerified={() => {
                    setVerified(true)
                    setNeedsStepUp(false)
                  }}
                />
              )}
              <Button variant='contained' size='large' disabled={loading} onClick={startPayment}>
                {loading ? 'Starting checkout…' : `Pay ${money(invoice.amountDueCents)}`}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {invoice.receiptUrl && invoice.amountDueCents <= 0 && (
        <Button href={invoice.receiptUrl} target='_blank' variant='outlined'>
          Download receipt
        </Button>
      )}

      <Button href='/portal/invoices' variant='text'>
        Back to invoices
      </Button>
    </PortalShell>
  )
}
