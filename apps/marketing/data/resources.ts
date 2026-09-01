export type ResourceItem = {
  title: string
  description: string
  href: string
  tag?: string
  external?: boolean
}

export type ResourceCategory = {
  id: string
  title: string
  description: string
  items: ResourceItem[]
}

/** Starter resources — expand as real content is published. No fabricated articles. */
export const resourceCategories: ResourceCategory[] = [
  {
    id: 'guides',
    title: 'Guides',
    description: 'Practical guides for running a professional lighting business on one operating platform.',
    items: [
      {
        title: 'From Lead to Lights: The Lighting Business Operating Cycle',
        description: 'How professional lighting companies move from inquiry through install, service, takedown, and renewal.',
        href: '/features',
        tag: 'Overview'
      },
      {
        title: 'Planning Install Season Capacity',
        description: 'Why crew workload, scheduling, and pipeline visibility matter before peak weeks arrive.',
        href: '/scheduling',
        tag: 'Operations'
      }
    ]
  },
  {
    id: 'product-updates',
    title: 'Product Updates',
    description: 'Release notes and platform updates will appear here as they are published.',
    items: [
      {
        title: 'Product updates coming soon',
        description: 'LightForge product updates will be published on this page. Check back or book a demo for the latest.',
        href: '/demo',
        tag: 'Coming soon'
      }
    ]
  },
  {
    id: 'lighting-business',
    title: 'Lighting Business Resources',
    description: 'Industry-focused resources for holiday, event, and permanent lighting operators.',
    items: [
      {
        title: 'Holiday Lighting Operations',
        description: 'Seasonal leads, installs, takedowns, storage, and renewals for holiday lighting companies.',
        href: '/solutions/holiday-lighting',
        tag: 'Solutions'
      },
      {
        title: 'Event Lighting Operations',
        description: 'Venue timelines, equipment, crews, and billing for event lighting work.',
        href: '/solutions/event-lighting',
        tag: 'Solutions'
      },
      {
        title: 'Permanent Lighting Operations',
        description: 'Project lifecycle, service history, and long-term customer relationships.',
        href: '/solutions/permanent-lighting',
        tag: 'Solutions'
      }
    ]
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Getting started and product help for LightForge customers and prospects.',
    items: [
      {
        title: 'Help Center',
        description: 'Browse help topics for CRM, estimating, scheduling, field, inventory, billing, and renewals.',
        href: '/help',
        tag: 'Help'
      },
      {
        title: 'Book a Demo',
        description: 'See LightForge in action with a walkthrough tailored to your lighting business.',
        href: '/demo',
        tag: 'Demo'
      },
      {
        title: 'Contact',
        description: 'Reach the LightForge team for pricing, implementation, and support questions.',
        href: '/contact',
        tag: 'Contact'
      }
    ]
  }
]
