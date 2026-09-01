export type HelpArticle = {
  title: string
  description: string
  href?: string
  status?: 'available' | 'coming-soon'
}

export type HelpCategory = {
  id: string
  title: string
  description: string
  articles: HelpArticle[]
}

/** Help center structure — articles expand as documentation is published. */
export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Orientation for new LightForge users and teams preparing for the season.',
    articles: [
      {
        title: 'What is LightForge?',
        description: 'An overview of the operating platform for professional lighting companies.',
        href: '/about',
        status: 'available'
      },
      {
        title: 'Book a demo',
        description: 'Schedule a walkthrough of CRM, scheduling, field, inventory, and renewals.',
        href: '/demo',
        status: 'available'
      },
      {
        title: 'Onboarding checklist',
        description: 'Step-by-step onboarding documentation will be published here.',
        status: 'coming-soon'
      }
    ]
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Leads, customers, pipeline, and follow-ups.',
    articles: [
      { title: 'Managing leads', description: 'Help article coming soon.', status: 'coming-soon' },
      { title: 'Sales pipeline', description: 'Help article coming soon.', status: 'coming-soon' },
      { title: 'Customer records', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'estimating',
    title: 'Estimating',
    description: 'Packages, proposals, approvals, and deposits.',
    articles: [
      { title: 'Building estimates', description: 'Help article coming soon.', status: 'coming-soon' },
      { title: 'Proposal approval', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    description: 'Install, service, and takedown calendars.',
    articles: [
      { title: 'Installation calendar', description: 'Help article coming soon.', status: 'coming-soon' },
      { title: 'Crew assignment', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'field',
    title: 'Field Operations',
    description: 'LightForge Field for crews on site.',
    articles: [
      { title: 'Daily job workflow', description: 'Help article coming soon.', status: 'coming-soon' },
      { title: 'Job completion', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Warehouses, allocation, returns, and storage.',
    articles: [
      { title: 'Material allocation', description: 'Help article coming soon.', status: 'coming-soon' },
      { title: 'Customer storage', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Deposits, invoices, and payments.',
    articles: [
      { title: 'Deposits and invoices', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'portal',
    title: 'Customer Portal',
    description: 'Customer-facing approvals, messages, and renewals.',
    articles: [
      { title: 'Customer portal overview', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'service',
    title: 'Service',
    description: 'Service requests and resolution.',
    articles: [
      { title: 'Service tickets', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'renewals',
    title: 'Renewals',
    description: 'Returning customers and next-season campaigns.',
    articles: [
      { title: 'Renewal workflow', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  },
  {
    id: 'admin',
    title: 'Account Administration',
    description: 'Users, settings, and workspace administration.',
    articles: [
      { title: 'Account settings', description: 'Help article coming soon.', status: 'coming-soon' }
    ]
  }
]
