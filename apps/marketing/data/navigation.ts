export type NavLink = {
  label: string
  to?: string
  description?: string
  children?: NavLink[]
}

export type MegaColumn = {
  title: string
  items: NavLink[]
}

export const productMegaMenu: MegaColumn[] = [
  {
    title: 'Sales',
    items: [
      { label: 'CRM & Leads', to: '/crm', description: 'Capture and convert lighting leads' },
      { label: 'Customers', to: '/crm', description: 'Customer and property records' },
      { label: 'Sales Pipeline', to: '/crm', description: 'Track opportunities to close' },
      { label: 'Estimating', to: '/estimating', description: 'Packages, pricing, and scope' },
      { label: 'Proposals', to: '/proposals', description: 'Proposals built to sell' },
      { label: 'Follow-Ups', to: '/crm', description: 'Never lose a warm lead' },
      { label: 'Marketing', to: '/marketing', description: 'Seasonal campaigns and outreach' }
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Scheduling', to: '/scheduling', description: 'Own your install calendar' },
      { label: 'Jobs', to: '/scheduling', description: 'Installation and service jobs' },
      { label: 'Crews', to: '/field', description: 'Crew assignment and workload' },
      { label: 'Field Operations', to: '/field', description: 'Mobile tools for crews' },
      { label: 'Service', to: '/service', description: 'Tickets without schedule chaos' },
      { label: 'Takedowns', to: '/takedowns', description: 'Removals without the mess' },
      { label: 'Renewals', to: '/renewals', description: 'Turn this season into next' }
    ]
  },
  {
    title: 'Materials',
    items: [
      { label: 'Inventory', to: '/inventory', description: 'Know where everything is' },
      { label: 'Warehouses', to: '/inventory', description: 'Locations and bins' },
      { label: 'Storage', to: '/inventory', description: 'Customer storage assignments' },
      { label: 'Material Allocation', to: '/inventory', description: 'Job materials and returns' }
    ]
  },
  {
    title: 'Financial',
    items: [
      { label: 'Estimates', to: '/estimating', description: 'Pricing that closes' },
      { label: 'Deposits', to: '/payments', description: 'Collect before install' },
      { label: 'Invoices', to: '/payments', description: 'Balances and billing' },
      { label: 'Payments', to: '/payments', description: 'Deposits to final payment' }
    ]
  },
  {
    title: 'Customer Experience',
    items: [
      { label: 'Customer Portal', to: '/customer-portal', description: 'Approvals and status' },
      { label: 'Communication', to: '/customer-portal', description: 'Messages customers expect' },
      { label: 'Approvals', to: '/proposals', description: 'Digital acceptance' },
      { label: 'Service Requests', to: '/service', description: 'Self-serve service intake' }
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Dashboards', to: '/analytics', description: 'Seasonal command center' },
      { label: 'Analytics', to: '/analytics', description: 'Know your numbers' },
      { label: 'Reports', to: '/analytics', description: 'Crew and job performance' },
      { label: 'Performance', to: '/analytics', description: 'Conversion and profitability' }
    ]
  }
]

export const mainNav: NavLink[] = [
  { label: 'Product', children: productMegaMenu.flatMap(column => column.items) },
  { label: 'Features', to: '/features' },
  {
    label: 'Solutions',
    children: [
      { label: 'Holiday Lighting', to: '/solutions/holiday-lighting' },
      { label: 'Event Lighting', to: '/solutions/event-lighting' },
      { label: 'Permanent Lighting', to: '/solutions/permanent-lighting' },
      { label: 'All Solutions', to: '/solutions' }
    ]
  },
  { label: 'Pricing', to: '/pricing' },
  {
    label: 'Resources',
    children: [
      { label: 'Resources', to: '/resources' },
      { label: 'Help Center', to: '/help' },
      { label: 'Integrations', to: '/integrations' }
    ]
  },
  {
    label: 'Company',
    children: [
      { label: 'About', to: '/about' },
      { label: 'Security', to: '/security' },
      { label: 'Contact', to: '/contact' }
    ]
  }
]

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'CRM', to: '/crm' },
      { label: 'Estimating', to: '/estimating' },
      { label: 'Scheduling', to: '/scheduling' },
      { label: 'Field', to: '/field' },
      { label: 'Inventory', to: '/inventory' },
      { label: 'Analytics', to: '/analytics' }
    ]
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Holiday Lighting', to: '/solutions/holiday-lighting' },
      { label: 'Event Lighting', to: '/solutions/event-lighting' },
      { label: 'Permanent Lighting', to: '/solutions/permanent-lighting' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resources', to: '/resources' },
      { label: 'Help Center', to: '/help' },
      { label: 'Contact', to: '/contact' },
      { label: 'Demo', to: '/demo' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Security', to: '/security' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/privacy#cookies' }
    ]
  }
] as const
