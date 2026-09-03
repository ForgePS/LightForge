import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Sales & Customers',
    icon: 'tabler-users',
    children: [
      { label: 'Customers', href: '/customers', icon: 'tabler-user' },
      { label: 'Properties', href: '/properties', icon: 'tabler-home' },
      { label: 'Mockups', href: '/mockups', icon: 'tabler-photo' },
      { label: 'Lighting Package', href: '/lighting-items', icon: 'tabler-bulb' },
      { label: 'Photos', href: '/photos', icon: 'tabler-camera' },
      { label: 'Contacts', href: '/contacts', icon: 'tabler-address-book' },
      { label: 'Proposals', href: '/proposals', icon: 'tabler-file-description' },
      { label: 'Documents', href: '/documents', icon: 'tabler-files' },
      { label: 'Commercial Accounts', href: '/commercial-accounts', icon: 'tabler-building-skyscraper' },
      { label: 'Rebooking', href: '/rebooking', icon: 'tabler-refresh' }
    ]
  },
  {
    label: 'Operations',
    icon: 'tabler-tool',
    children: [
      { label: 'Jobs', href: '/jobs', icon: 'tabler-briefcase' },
      { label: 'Project Prep', href: '/project-prep', icon: 'tabler-clipboard-list' },
      { label: 'Schedule', href: '/schedule', icon: 'tabler-calendar' },
      { label: 'Routes', href: '/routes', icon: 'tabler-route' },
      { label: 'Service Issues', href: '/service-issues', icon: 'tabler-alert-triangle' },
      { label: 'Time Clock', href: '/time-clock', icon: 'tabler-clock' }
    ]
  },
  {
    label: 'Inventory & Storage',
    icon: 'tabler-packages',
    children: [
      { label: 'Customer Storage', href: '/customer-storage', icon: 'tabler-box' },
      { label: 'Inventory', href: '/inventory', icon: 'tabler-building-warehouse' }
    ]
  },
  {
    label: 'Finance',
    icon: 'tabler-currency-dollar',
    children: [
      { label: 'Invoices', href: '/invoices', icon: 'tabler-file-invoice' },
      { label: 'Payments', href: '/payments', icon: 'tabler-credit-card' }
    ]
  },
  {
    label: 'Marketing',
    icon: 'tabler-megaphone',
    children: [
      { label: 'Messages', href: '/messages', icon: 'tabler-mail' },
      { label: 'Reviews & Referrals', href: '/reviews', icon: 'tabler-star' },
      { label: 'Sign Tracker', href: '/sign-tracker', icon: 'tabler-flag' }
    ]
  },
  {
    label: 'Administration',
    icon: 'tabler-settings',
    children: [
      { label: 'Automation', href: '/automation', icon: 'tabler-bolt' },
      { label: 'Reports', href: '/reports', icon: 'tabler-chart-bar' },
      { label: 'Settings', href: '/settings', icon: 'tabler-settings-cog' }
    ]
  }
]

export default verticalMenuData
