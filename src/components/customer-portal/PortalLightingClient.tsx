'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

import PortalShell from '@components/customer-portal/PortalShell'

type LightingGroup = {
  serviceArea: string
  items: Array<{
    id: string
    name: string
    description: string | null
    lightType: string | null
    color: string | null
    quantity: number | null
    linearFeet: number | null
    installationLocation: string | null
    customerNotes: string | null
    status: string | null
  }>
}

export default function PortalLightingClient({
  lighting,
  error
}: {
  lighting: { propertySummary: string | null; groups: LightingGroup[] } | null
  error?: string
}) {
  if (error || !lighting) {
    return (
      <PortalShell title='My Lighting'>
        <Alert severity='warning'>{error || 'Unable to load lighting package'}</Alert>
      </PortalShell>
    )
  }

  return (
    <PortalShell title='My Lighting' subtitle={lighting.propertySummary || undefined}>
      {lighting.groups.length === 0 ? (
        <Alert severity='info'>
          Your lighting package will appear here once your contractor marks items as customer-visible.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {lighting.groups.map(group => (
            <Card key={group.serviceArea} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant='h6' className='mbe-2'>
                  {group.serviceArea}
                </Typography>
                <Stack spacing={2}>
                  {group.items.map(item => (
                    <Stack key={item.id} spacing={0.5}>
                      <Stack direction='row' justifyContent='space-between' gap={1} alignItems='center'>
                        <Typography fontWeight={600}>{item.name}</Typography>
                        {item.status && <Chip size='small' label={item.status} />}
                      </Stack>
                      {[item.color, item.lightType].filter(Boolean).length > 0 && (
                        <Typography variant='body2' color='text.secondary'>
                          {[item.color, item.lightType].filter(Boolean).join(' · ')}
                        </Typography>
                      )}
                      {item.linearFeet != null && (
                        <Typography variant='body2'>{item.linearFeet} linear feet</Typography>
                      )}
                      {item.quantity != null && <Typography variant='body2'>Qty {item.quantity}</Typography>}
                      {item.installationLocation && (
                        <Typography variant='body2'>{item.installationLocation}</Typography>
                      )}
                      {item.customerNotes && (
                        <Typography variant='body2' color='text.secondary'>
                          {item.customerNotes}
                        </Typography>
                      )}
                      {item.description && (
                        <Typography variant='body2' color='text.secondary'>
                          {item.description}
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button href='/portal/renewal' variant='outlined'>
            Request an Addition
          </Button>
        </Stack>
      )}
    </PortalShell>
  )
}
