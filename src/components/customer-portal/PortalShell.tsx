'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import type { ReactNode } from 'react'

const NAV = [
  { href: '/portal/home', label: 'Home' },
  { href: '/portal/lighting', label: 'My Lighting' },
  { href: '/portal/schedule', label: 'Schedule' },
  { href: '/portal/service', label: 'Service' },
  { href: '/portal/account', label: 'Account' }
]

export default function PortalShell({
  title,
  subtitle,
  children,
  accent = '#0F3D2E'
}: {
  title: string
  subtitle?: string
  children: ReactNode
  accent?: string
}) {
  const pathname = usePathname()

  return (
    <Stack
      className='min-bs-screen'
      sx={{ background: `linear-gradient(180deg, ${accent}14 0%, #f7f4ef 36%, #f7f4ef 100%)` }}
    >
      <Stack spacing={3} className='p-4' maxWidth={560} mx='auto' width='100%'>
        <Stack direction='row' justifyContent='space-between' alignItems='center' gap={1}>
          <Button component={Link} href='/portal/home' size='small' color='inherit'>
            ← Home
          </Button>
          <Button component={Link} href='/portal/sign-out' size='small' color='inherit'>
            Sign out
          </Button>
        </Stack>

        <div>
          <Typography variant='h4' fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color='text.secondary' className='mbs-1'>
              {subtitle}
            </Typography>
          )}
        </div>

        {children}

        <Stack
          direction='row'
          justifyContent='space-around'
          className='position-sticky'
          sx={{
            position: 'sticky',
            bottom: 12,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            py: 1
          }}
        >
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size='small'
                sx={{
                  color: active ? accent : 'text.secondary',
                  fontWeight: active ? 700 : 500,
                  minWidth: 0,
                  px: 1
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>
      </Stack>
    </Stack>
  )
}
