'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { logout } from '@libs/auth/client'
import type { SessionUser } from '@libs/firebase/types'

export default function PlatformUserMenu({ user }: { user: SessionUser }) {
  const router = useRouter()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const handleToggle = () => setOpen(prev => !prev)

  const handleClickAway = (event: globalThis.MouseEvent | TouchEvent) => {
    if (anchorRef.current?.contains(event.target as Node)) return
    setOpen(false)
  }

  const navigateAndClose = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  const initials = (user.displayName || user.email || 'A')
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <>
      <Button ref={anchorRef} onClick={handleToggle} className='gap-2 normal-case' color='inherit'>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.875rem' }}>{initials}</Avatar>
        <Stack alignItems='flex-start' className='hidden sm:flex'>
          <Typography variant='body2' className='font-medium'>
            {user.displayName || 'Platform admin'}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {user.email}
          </Typography>
        </Stack>
        <i className='tabler-chevron-down text-base' />
      </Button>
      <Popper open={open} anchorEl={anchorRef.current} transition placement='bottom-end' sx={{ zIndex: 1300 }}>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper elevation={8} sx={{ mt: 1, minWidth: 220 }}>
              <ClickAwayListener onClickAway={handleClickAway}>
                <MenuList autoFocusItem={open}>
                  <MenuItem onClick={() => navigateAndClose('/dashboard')}>Open tenant app</MenuItem>
                  <MenuItem onClick={() => navigateAndClose('/platform')}>Platform overview</MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={async () => {
                      setOpen(false)
                      await handleLogout()
                    }}
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}
