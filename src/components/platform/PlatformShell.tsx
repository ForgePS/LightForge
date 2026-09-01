'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import type { ReactNode } from 'react'

import type { SessionUser } from '@libs/firebase/types'

const drawerWidth = 260

const nav = [
  { href: '/platform', label: 'Overview', icon: 'tabler-dashboard' },
  { href: '/platform/tenants', label: 'Tenants', icon: 'tabler-building' },
  { href: '/platform/tenants/new', label: 'New tenant', icon: 'tabler-plus' },
  { href: '/platform/plans', label: 'Plans & pricing', icon: 'tabler-credit-card' }
]

export default function PlatformShell({
  user,
  children
}: {
  user: SessionUser
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position='fixed' color='default' elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', zIndex: 1201 }}>
        <Toolbar className='gap-3'>
          <Typography variant='h6' className='grow'>
            LightForge Platform Admin
          </Typography>
          <Chip size='small' label='Platform' color='primary' />
          <Typography variant='body2' color='text.secondary'>
            {user.email}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', mt: 8 }
        }}
      >
        <List>
          {nav.map(item => {
            const selected = item.href === '/platform' ? pathname === item.href : pathname.startsWith(item.href)

            return (
              <ListItemButton key={item.href} component={Link} href={item.href} selected={selected}>
                <ListItemIcon>
                  <i className={item.icon} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>
      <Box component='main' sx={{ flexGrow: 1, p: 4, mt: 8, maxWidth: '100%' }}>
        {children}
      </Box>
    </Box>
  )
}
