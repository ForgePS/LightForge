'use client'

import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

import PortalShell from '@components/customer-portal/PortalShell'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

type InvoiceRow = {
  publicNumber: string
  title: string | null
  customerStatus: string
  amountCents: number
  amountDueCents: number
  dueDate: string | null
  pastDue: boolean
}

export default function PortalInvoicesListClient({
  invoices,
  balanceCents,
  onlinePaymentsEnabled,
  error
}: {
  invoices: InvoiceRow[]
  balanceCents: number
  onlinePaymentsEnabled: boolean
  error?: string
}) {
  return (
    <PortalShell title='Invoices' subtitle='Balances, payments, and receipts'>
      {error && <Alert severity='warning'>{error}</Alert>}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant='subtitle2' color='text.secondary'>
            Current balance
          </Typography>
          <Typography variant='h4'>{money(balanceCents)}</Typography>
          {!onlinePaymentsEnabled && (
            <Typography variant='body2' color='text.secondary' className='mbs-1'>
              Online payments are currently off. You can still view invoices here.
            </Typography>
          )}
        </CardContent>
      </Card>

      {!error && invoices.length === 0 && <Alert severity='info'>No invoices yet.</Alert>}

      <Stack spacing={2}>
        {invoices.map(invoice => (
          <Card
            key={invoice.publicNumber}
            component={Link}
            href={`/portal/invoices/${encodeURIComponent(invoice.publicNumber)}`}
            elevation={0}
            sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', textDecoration: 'none', color: 'inherit' }}
          >
            <CardContent>
              <Stack spacing={1}>
                <Stack direction='row' justifyContent='space-between' gap={1}>
                  <Typography fontWeight={700}>{invoice.publicNumber}</Typography>
                  <Chip
                    size='small'
                    label={invoice.customerStatus}
                    color={invoice.pastDue ? 'error' : invoice.amountDueCents === 0 ? 'success' : 'default'}
                  />
                </Stack>
                {invoice.title && <Typography>{invoice.title}</Typography>}
                <Typography color='text.secondary'>
                  {invoice.amountDueCents > 0
                    ? `${money(invoice.amountDueCents)} due`
                    : `${money(invoice.amountCents)} paid`}
                </Typography>
                {invoice.dueDate && (
                  <Typography variant='body2' color={invoice.pastDue ? 'error' : 'text.secondary'}>
                    Due {invoice.dueDate}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Button href='/portal/home' variant='outlined'>
        Back to home
      </Button>
    </PortalShell>
  )
}
