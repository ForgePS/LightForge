'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

import PortalShell from '@components/customer-portal/PortalShell'

type RequestDetail = {
  publicNumber: string
  title: string
  problemType: string | null
  problemLocation: string | null
  description: string | null
  status: string
  submittedAt: string | null
  updatedAt: string | null
  resolutionSummary: string | null
  completedAt: string | null
  photoUrls: string[]
}

export default function PortalServiceDetailClient({
  request,
  error
}: {
  request: RequestDetail | null
  error?: string
}) {
  if (error || !request) {
    return (
      <PortalShell title='Service request'>
        <Alert severity='warning'>{error || 'Request not found'}</Alert>
        <Button href='/portal/service' variant='outlined'>
          Back to service
        </Button>
      </PortalShell>
    )
  }

  return (
    <PortalShell title={request.publicNumber} subtitle={request.title}>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Chip label={request.status} sx={{ alignSelf: 'flex-start' }} color='primary' />
            {request.problemType && <Typography>Type: {request.problemType}</Typography>}
            {request.problemLocation && <Typography>Location: {request.problemLocation}</Typography>}
            {request.description && (
              <Typography color='text.secondary'>{request.description}</Typography>
            )}
            {request.submittedAt && (
              <Typography variant='body2' color='text.secondary'>
                Submitted {request.submittedAt}
              </Typography>
            )}
            {request.resolutionSummary && (
              <Alert severity='success'>
                <Typography fontWeight={600}>Resolution</Typography>
                <Typography>{request.resolutionSummary}</Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {request.photoUrls.length > 0 && (
        <Stack direction='row' flexWrap='wrap' gap={1}>
          {request.photoUrls.map(url => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt='Service request attachment'
              style={{ width: '48%', borderRadius: 12, objectFit: 'cover', aspectRatio: '1' }}
            />
          ))}
        </Stack>
      )}

      <Button href='/portal/service' variant='outlined'>
        Back to service list
      </Button>
      {request.status === 'Completed' && (
        <Button href='/portal/service/new' variant='contained' color='warning'>
          Issue Not Resolved
        </Button>
      )}
    </PortalShell>
  )
}
