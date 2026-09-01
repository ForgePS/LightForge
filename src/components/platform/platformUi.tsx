'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { SubscriptionStatus, TenantStatus } from '@libs/firebase/types'

type StatTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'

const tenantStatusColor: Record<TenantStatus, 'default' | 'success' | 'warning' | 'error'> = {
  active: 'success',
  trial: 'warning',
  suspended: 'error'
}

const subscriptionStatusColor: Record<SubscriptionStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success',
  trialing: 'warning',
  past_due: 'error',
  canceled: 'default',
  paused: 'info'
}

export function PlatformStatusChip({
  kind,
  value
}: {
  kind: 'tenant' | 'subscription'
  value: string
}) {
  const color =
    kind === 'tenant'
      ? tenantStatusColor[value as TenantStatus] || 'default'
      : subscriptionStatusColor[value as SubscriptionStatus] || 'default'

  return <Chip size='small' label={value.replace('_', ' ')} color={color} variant='tonal' />
}

export function PlatformStatCard({
  label,
  value,
  icon,
  tone = 'primary',
  helper
}: {
  label: string
  value: string | number
  icon: string
  tone?: StatTone
  helper?: string
}) {
  const theme = useTheme()
  const palette = theme.palette[tone]

  return (
    <Card className='h-full'>
      <CardContent>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={2}>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              {label}
            </Typography>
            <Typography variant='h4' className='font-semibold'>
              {value}
            </Typography>
            {helper && (
              <Typography variant='caption' color='text.secondary'>
                {helper}
              </Typography>
            )}
          </Box>
          <Avatar
            variant='rounded'
            sx={{
              bgcolor: alpha(palette.main, 0.12),
              color: palette.main,
              width: 44,
              height: 44
            }}
          >
            <i className={icon} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function PlatformPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions
}: {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: ReactNode
}) {
  return (
    <Stack spacing={2}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs>
          {breadcrumbs.map(item =>
            item.href ? (
              <Link key={item.label} href={item.href} className='no-underline'>
                <Typography color='primary.main' variant='body2'>
                  {item.label}
                </Typography>
              </Link>
            ) : (
              <Typography key={item.label} color='text.secondary' variant='body2'>
                {item.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' flexWrap='wrap' gap={2}>
        <Box>
          <Typography variant='h4'>{title}</Typography>
          {subtitle && (
            <Typography color='text.secondary' sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Stack>
    </Stack>
  )
}

export function PlatformQuickAction({
  title,
  description,
  href,
  icon
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  const theme = useTheme()

  return (
    <Card className='h-full transition-shadow hover:shadow-md'>
      <CardContent>
        <Link href={href} className='no-underline text-inherit'>
          <Stack spacing={1.5}>
            <Avatar
              variant='rounded'
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', width: 40, height: 40 }}
            >
              <i className={icon} />
            </Avatar>
            <Typography variant='h6'>{title}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {description}
            </Typography>
          </Stack>
        </Link>
      </CardContent>
    </Card>
  )
}

export function formatPlatformDate(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function tenantInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
}
