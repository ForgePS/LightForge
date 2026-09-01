'use client'

import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { useTenant } from '@components/providers/TenantProvider'

export default function NoTenantState({ title = 'No workspace selected' }: { title?: string }) {
  const { user } = useTenant()

  return (
    <Stack spacing={2} className='max-is-[520px]'>
      <Typography variant='h4'>{title}</Typography>
      <Typography color='text.secondary'>
        {user.isPlatformAdmin
          ? 'Select or open a tenant from Platform admin, or create a new workspace first.'
          : 'You need an active workspace to use this area. Contact your admin or start a trial.'}
      </Typography>
      <Stack direction='row' spacing={2}>
        {user.isPlatformAdmin && (
          <Button component={Link} href='/platform' variant='contained'>
            Platform admin
          </Button>
        )}
        <Button component={Link} href='/dashboard' variant='outlined'>
          Back to dashboard
        </Button>
      </Stack>
    </Stack>
  )
}
