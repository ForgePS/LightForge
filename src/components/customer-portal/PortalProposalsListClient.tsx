'use client'

import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

import PortalShell from '@components/customer-portal/PortalShell'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

type ProposalRow = {
  publicNumber: string
  title: string
  customerStatus: string
  amountCents: number
  propertyName: string | null
  updatedAt: string | null
}

export default function PortalProposalsListClient({
  proposals,
  error
}: {
  proposals: ProposalRow[]
  error?: string
}) {
  return (
    <PortalShell title='Proposals' subtitle='Review, request changes, accept, and sign'>
      {error && <Alert severity='warning'>{error}</Alert>}
      {!error && proposals.length === 0 && <Alert severity='info'>No proposals are ready for review.</Alert>}
      <Stack spacing={2}>
        {proposals.map(proposal => (
          <Card
            key={proposal.publicNumber}
            component={Link}
            href={`/portal/proposals/${encodeURIComponent(proposal.publicNumber)}`}
            elevation={0}
            sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', textDecoration: 'none', color: 'inherit' }}
          >
            <CardContent>
              <Stack spacing={1}>
                <Stack direction='row' justifyContent='space-between' gap={1}>
                  <Typography fontWeight={700}>{proposal.publicNumber}</Typography>
                  <Chip size='small' label={proposal.customerStatus} />
                </Stack>
                <Typography>{proposal.title}</Typography>
                <Typography color='text.secondary'>{money(proposal.amountCents)}</Typography>
                {proposal.propertyName && (
                  <Typography variant='body2' color='text.secondary'>
                    {proposal.propertyName}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PortalShell>
  )
}
