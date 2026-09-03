'use client'

import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

import type { PortalHomeDto } from '@libs/customer-portal/types'

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

const quickLinks: Array<{ key: keyof PortalHomeDto['features']; label: string; href: string }> = [
  { key: 'myLighting', label: 'My Lighting', href: '/portal/lighting' },
  { key: 'photos', label: 'Photos', href: '/portal/photos' },
  { key: 'schedule', label: 'Schedule', href: '/portal/schedule' },
  { key: 'proposals', label: 'Proposal', href: '/portal/proposals' },
  { key: 'invoices', label: 'Invoices', href: '/portal/invoices' },
  { key: 'agreements', label: 'Agreements', href: '/portal/documents' },
  { key: 'messages', label: 'Messages', href: '/portal/messages' },
  { key: 'property', label: 'My Property', href: '/portal/property' },
  { key: 'renewal', label: 'Renew Service', href: '/portal/renewal' },
  { key: 'serviceRequests', label: 'Service', href: '/portal/service' }
]

export default function PortalHomeClient({ home, error }: { home: PortalHomeDto | null; error?: string }) {
  if (!home) {
    return (
    <Stack className='min-bs-screen items-center justify-center p-6' spacing={3} maxWidth={480} mx='auto'>
      <Alert severity='error'>{error || 'Unable to load portal'}</Alert>
    </Stack>
    )
  }

  const accent = home.primaryColor || '#0F3D2E'

  return (
    <Stack
      className='min-bs-screen'
      sx={{
        background: `linear-gradient(180deg, ${accent}14 0%, #f7f4ef 42%, #f7f4ef 100%)`
      }}
    >
      <Stack spacing={3} className='p-4' maxWidth={560} mx='auto' width='100%'>
        <Stack direction='row' justifyContent='space-between' alignItems='center' gap={2}>
          <Stack direction='row' alignItems='center' gap={1.5}>
            {home.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={home.logoUrl} alt={home.contractorName} style={{ height: 40, maxWidth: 140, objectFit: 'contain' }} />
            ) : (
              <Typography variant='h5' fontWeight={700} sx={{ color: accent }}>
                {home.contractorName}
              </Typography>
            )}
          </Stack>
          <Button href='/portal/sign-out' size='small' color='inherit'>
            Sign out
          </Button>
        </Stack>

        <div>
          <Typography variant='overline' color='text.secondary'>
            {home.portalName}
          </Typography>
          <Typography variant='h4' fontWeight={700}>
            {home.customerGreeting}
          </Typography>
          {home.propertySummary && (
            <Typography color='text.secondary' className='mbs-1'>
              {home.propertySummary}
            </Typography>
          )}
          <Typography variant='body2' color='text.secondary'>
            {home.seasonLabel}
          </Typography>
        </div>

        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Chip label={home.status.label} sx={{ alignSelf: 'flex-start', bgcolor: accent, color: '#fff' }} />
              {home.status.detail && <Typography variant='h6'>{home.status.detail}</Typography>}
              {home.status.date && (
                <Typography color='text.secondary'>Date: {home.status.date}</Typography>
              )}
              <Button
                component={Link}
                href={home.primaryAction.href}
                variant='contained'
                size='large'
                sx={{ bgcolor: accent, '&:hover': { bgcolor: accent } }}
              >
                {home.primaryAction.actionLabel}
              </Button>
              <Typography variant='body2' color='text.secondary'>
                {home.primaryAction.message}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {home.balance && (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Account balance
                </Typography>
                <Typography variant='h5'>{formatMoney(home.balance.amountCents)}</Typography>
                {home.balance.invoiceNumber && (
                  <Typography variant='body2'>Invoice {home.balance.invoiceNumber}</Typography>
                )}
                {home.balance.dueDate && (
                  <Typography variant='body2' color={home.balance.pastDue ? 'error' : 'text.secondary'}>
                    Due {home.balance.dueDate}
                    {home.balance.pastDue ? ' · Past due' : ''}
                  </Typography>
                )}
                <Button component={Link} href='/portal/invoices' variant='outlined'>
                  Pay Now
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {home.features.serviceRequests && (
          <Button
            component={Link}
            href='/portal/service/new'
            variant='contained'
            size='large'
            color='warning'
            sx={{ py: 1.5, fontWeight: 700 }}
          >
            Report a Lighting Issue
          </Button>
        )}

        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant='h6' className='mbe-3'>
              Quick actions
            </Typography>
            <Stack direction='row' flexWrap='wrap' gap={1}>
              {quickLinks
                .filter(link => home.features[link.key])
                .map(link => (
                  <Button key={link.key} component={Link} href={link.href} variant='outlined' size='medium'>
                    {link.label}
                  </Button>
                ))}
            </Stack>
          </CardContent>
        </Card>

        {home.recentActivity.length > 0 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='h6' className='mbe-2'>
                Recent activity
              </Typography>
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                {home.recentActivity.map((item, index) => (
                  <Stack key={`${item.label}-${index}`}>
                    <Typography>{item.label}</Typography>
                    {item.at && (
                      <Typography variant='caption' color='text.secondary'>
                        {item.at}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Button component={Link} href='/portal/account' variant='text'>
          Account & preferences
        </Button>

        <Stack spacing={0.5} className='pbs-2 pbe-6' textAlign='center'>
          {(home.supportPhone || home.supportEmail) && (
            <Typography variant='body2' color='text.secondary'>
              Need help? {[home.supportPhone, home.supportEmail].filter(Boolean).join(' · ')}
            </Typography>
          )}
          {home.showPoweredBy && (
            <Typography variant='caption' color='text.secondary'>
              Powered by LightForge
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
