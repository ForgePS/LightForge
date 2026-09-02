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
const headerHeight = 64

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
        sx={{
          width: '100%',
          left: 0,
          right: 0,
          height: headerHeight,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: theme => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            height: headerHeight,
            minHeight: `${headerHeight}px !important`,
            maxHeight: headerHeight,
            px: 2,
            gap: 1.5,
            overflow: 'hidden'
          }}
        >
          <Link
            href='/platform'
            className='no-underline text-inherit'
            style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexShrink: 1 }}
          >
            <BrandedLogoMark branding={branding} height={28} />
            <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0, lineHeight: 1.15 }}>
              <Typography variant='subtitle1' fontWeight={700} noWrap>
                {platformName}
              </Typography>
              <Typography variant='caption' color='text.secondary' noWrap display='block'>
                Admin control center
              </Typography>
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            size='small'
            label='Platform admin'
            color='primary'
            variant='tonal'
            sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}
          />
          <Button
            href='/dashboard'
            size='small'
            variant='outlined'
            startIcon={<i className='tabler-external-link' />}
            sx={{ flexShrink: 0, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Tenant app
          </Button>
          <Box sx={{ flexShrink: 0 }}>
            <PlatformUserMenu user={user} />
          </Box>
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
            top: headerHeight,
            height: `calc(100% - ${headerHeight}px)`,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: theme => alpha(theme.palette.primary.main, 0.02)
          }
        }}
      >
        <Box sx={{ overflowY: 'auto', height: '100%', pb: 3 }}>
          {navSections.map(section => (
            <List
              key={section.title}
              dense
              subheader={
                <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '36px', pt: 1 }}>
                  {section.title}
                </ListSubheader>
              }
            >
              {section.items.map(item => (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={isSelected(item.href, 'exact' in item ? item.exact : false)}
                  sx={{ mx: 1.5, mb: 0.5, borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <i className={item.icon} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
              ))}
            </List>
          ))}
          <Divider sx={{ my: 2, mx: 2 }} />
          <Box sx={{ px: 3 }}>
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
        </Box>
      </Drawer>

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          minWidth: 0,
          pt: `${headerHeight}px`,
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: '100%' }}>{children}</Box>
      </Box>
    </Box>
  )
}
