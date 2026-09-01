import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Sales & Customers',
    icon: 'tabler-users',
    children: [
      { label: 'Customers', href: '/customers' },
      { label: 'Properties', href: '/properties' },
      { label: 'Mockups', href: '/mockups' },
      { label: 'Contacts', href: '/contacts' },
      { label: 'Proposals', href: '/proposals' },
      { label: 'Commercial Accounts', href: '/commercial-accounts' },
      { label: 'Rebooking', href: '/rebooking' }
    ]
  },
  {
    label: 'Operations',
    icon: 'tabler-tool',
    children: [
      { label: 'Jobs', href: '/jobs' },
      { label: 'Project Prep', href: '/project-prep' },
      { label: 'Schedule', href: '/schedule' },
      { label: 'Routes', href: '/routes' },
      { label: 'Service Issues', href: '/service-issues' },
      { label: 'Time Clock', href: '/time-clock' }
    ]
  },
  {
    label: 'Inventory & Storage',
    icon: 'tabler-packages',
    children: [
      { label: 'Customer Storage', href: '/customer-storage' },
      { label: 'Inventory', href: '/inventory' }
    ]
  },
  {
    label: 'Finance',
    icon: 'tabler-currency-dollar',
    children: [{ label: 'Invoices', href: '/invoices' }]
  },
  {
    label: 'Marketing',
    icon: 'tabler-megaphone',
    children: [
      { label: 'Messages', href: '/messages' },
      { label: 'Reviews & Referrals', href: '/reviews' },
      { label: 'Sign Tracker', href: '/sign-tracker' }
    ]
  },
  {
    label: 'Administration',
    icon: 'tabler-settings',
    children: [
      { label: 'Automation', href: '/automation' },
      { label: 'Reports', href: '/reports' },
      { label: 'Settings', href: '/settings' }
    ]
  }
]

export default horizontalMenuData
