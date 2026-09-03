'use client'

import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import PortalShell from '@components/customer-portal/PortalShell'

type RequestRow = {
  publicNumber: string
  title: string
  status: string
  submittedAt: string | null
  problemType: string | null
  problemLocation: string | null
}

export default function PortalServiceListClient({
  requests,
  error
}: {
  requests: RequestRow[]
  error?: string
}) {
  return (
    <PortalShell title='Service' subtitle='Track lighting issues and service visits'>
      <Button href='/portal/service/new' variant='contained' size='large' color='warning' sx={{ fontWeight: 700 }}>
        Report a Lighting Issue
      </Button>

      {error && <Alert severity='warning'>{error}</Alert>}

      {requests.length === 0 && !error ? (
        <Alert severity='info'>No service requests yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {requests.map(request => (
            <Card
              key={request.publicNumber}
              component={Link}
              href={`/portal/service/${encodeURIComponent(request.publicNumber)}`}
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', textDecoration: 'none', color: 'inherit' }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction='row' justifyContent='space-between' gap={1}>
                    <Typography fontWeight={700}>{request.publicNumber}</Typography>
                    <Chip size='small' label={request.status} />
                  </Stack>
                  <Typography>{request.title}</Typography>
                  {(request.problemType || request.problemLocation) && (
                    <Typography variant='body2' color='text.secondary'>
                      {[request.problemType, request.problemLocation].filter(Boolean).join(' · ')}
                    </Typography>
                  )}
                  {request.submittedAt && (
                    <Typography variant='caption' color='text.secondary'>
                      Submitted {request.submittedAt}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PortalShell>
  )
}
