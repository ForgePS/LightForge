'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'

import BrandedLogoMark from '@components/branding/BrandedLogoMark'
import PlatformUserMenu from '@components/platform/PlatformUserMenu'
import type { BrandingSettings } from '@libs/branding/types'
import type { SessionUser } from '@libs/firebase/types'

const drawerWidth = 280

const navSections = [
  {
    title: 'Dashboard',
    items: [{ href: '/platform', label: 'Overview', icon: 'tabler-dashboard', exact: true }]
  },
  {
    title: 'Operations',
    items: [
      { href: '/platform/tenants', label: 'Tenants', icon: 'tabler-building' },
      { href: '/platform/users', label: 'Users', icon: 'tabler-users' },
      { href: '/platform/templates', label: 'Templates', icon: 'tabler-copy' },
      { href: '/platform/tenants/new', label: 'New tenant', icon: 'tabler-plus' }
    ]
  },
  {
    title: 'Billing',
    items: [
      { href: '/platform/billing', label: 'Subscriptions', icon: 'tabler-receipt' },
      { href: '/platform/plans', label: 'Plans & pricing', icon: 'tabler-credit-card' }
    ]
  },
  {
    title: 'Insights',
    items: [{ href: '/platform/analytics', label: 'Analytics', icon: 'tabler-chart-bar' }]
  },
  {
    title: 'Administration',
    items: [
      { href: '/platform/admins', label: 'Platform admins', icon: 'tabler-shield-lock' },
      { href: '/platform/settings', label: 'Settings', icon: 'tabler-settings' }
    ]
  }
]

export default function PlatformShell({
  user,
  children,
  branding,
  platformName = 'LightForge'
}: {
  user: SessionUser
  children: ReactNode
  branding?: BrandingSettings | null
  platformName?: string
}) {
  const pathname = usePathname()

  const isSelected = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position='fixed'
        color='inherit'
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <Toolbar className='gap-3'>
          <Link href='/platform' className='flex items-center gap-2 no-underline text-inherit min-is-0'>
            <BrandedLogoMark branding={branding} />
            <Box className='hidden md:block min-is-0'>
              <Typography variant='h6' noWrap>
                {platformName}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Admin control center
              </Typography>
            </Box>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <Chip size='small' label='Platform admin' color='primary' variant='tonal' className='hidden sm:flex' />
          <Button href='/dashboard' size='small' variant='outlined' startIcon={<i className='tabler-external-link' />}>
            Tenant app
          </Button>
          <PlatformUserMenu user={user} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            mt: 9,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: theme => alpha(theme.palette.primary.main, 0.02)
          }
        }}
      >
        {navSections.map(section => (
          <List key={section.title} subheader={<ListSubheader>{section.title}</ListSubheader>}>
            {section.items.map(item => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={isSelected(item.href, 'exact' in item ? item.exact : false)}
                sx={{ mx: 2, mb: 0.5, borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <i className={item.icon} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        ))}
        <Divider sx={{ mt: 2 }} />
        <Box sx={{ p: 3 }}>
          <Typography variant='caption' color='text.secondary' display='block'>
            Quick links
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <Link href='/platform/billing' className='no-underline'>
              <Typography variant='body2' color='primary.main'>
                Billing overview
              </Typography>
            </Link>
            <Link href='/platform/analytics' className='no-underline'>
              <Typography variant='body2' color='primary.main'>
                Platform analytics
              </Typography>
            </Link>
          </Stack>
        </Box>
      </Drawer>

      <Box component='main' sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, mt: 9, maxWidth: '100%' }}>
        {children}
      </Box>
    </Box>
  )
}
