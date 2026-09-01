export type SolutionHighlight = {
  title: string
  description: string
  icon: string
}

export type SolutionPageContent = {
  path: string
  eyebrow: string
  title: string
  description: string
  seoTitle: string
  audience: string
  highlights: SolutionHighlight[]
  outcomes: string[]
  relatedModules: { label: string; to: string }[]
}

export const solutionsOverview = {
  title: 'Solutions for Lighting Professionals',
  description:
    'LightForge is built for the way professional lighting companies actually operate — seasonal demand, crew capacity, materials, service, takedowns, and renewals.',
  seoTitle: 'Lighting Business Software Solutions'
}

export const solutionPages: Record<string, SolutionPageContent> = {
  'holiday-lighting': {
    path: '/solutions/holiday-lighting',
    eyebrow: 'Holiday Lighting',
    title: 'Run the full holiday lighting season from one platform.',
    description:
      'Manage seasonal leads, estimates, install schedules, crews, inventory, service, takedowns, storage, and renewals without stitching together spreadsheets and generic CRM tools.',
    seoTitle: 'Holiday Lighting CRM & Operations Software',
    audience: 'Built for holiday and Christmas lighting companies managing dense seasonal calendars and multi-crew operations.',
    highlights: [
      { title: 'Seasonal Leads', description: 'Capture and qualify holiday inquiries before peak capacity disappears.', icon: 'mdi-inbox-arrow-down-outline' },
      { title: 'Estimates', description: 'Quote packages quickly with property context and add-on options.', icon: 'mdi-calculator-variant-outline' },
      { title: 'Install Schedules', description: 'Own the install calendar when every week matters.', icon: 'mdi-calendar-month-outline' },
      { title: 'Crew Management', description: 'Assign crews, balance workload, and keep production moving.', icon: 'mdi-account-hard-hat' },
      { title: 'Inventory', description: 'Track materials from warehouse to truck to customer storage.', icon: 'mdi-warehouse' },
      { title: 'Service', description: 'Handle mid-season issues without losing install momentum.', icon: 'mdi-wrench-outline' },
      { title: 'Takedowns', description: 'Plan removals with the same discipline as installs.', icon: 'mdi-trailer' },
      { title: 'Storage', description: 'Know what belongs to which customer between seasons.', icon: 'mdi-archive-outline' },
      { title: 'Renewals', description: 'Turn this season’s installs into next season’s booked work.', icon: 'mdi-autorenew' }
    ],
    outcomes: [
      'Fill the calendar earlier with cleaner lead-to-estimate flow',
      'Protect crew capacity during peak install weeks',
      'Exit the season with organized takedowns and storage',
      'Start next season with renewal opportunities already identified'
    ],
    relatedModules: [
      { label: 'CRM', to: '/crm' },
      { label: 'Scheduling', to: '/scheduling' },
      { label: 'Takedowns', to: '/takedowns' },
      { label: 'Renewals', to: '/renewals' }
    ]
  },
  'event-lighting': {
    path: '/solutions/event-lighting',
    eyebrow: 'Event Lighting',
    title: 'From inquiry to install to takedown — built for event pace.',
    description:
      'Coordinate event inquiries, venues, estimates, scheduling, installation, equipment, crew assignments, takedown, and billing in one operating flow.',
    seoTitle: 'Event Lighting Business Software',
    audience: 'Built for event lighting companies juggling venues, timelines, equipment, and rapid turnaround jobs.',
    highlights: [
      { title: 'Event Inquiries', description: 'Capture event details and turn interest into actionable opportunities.', icon: 'mdi-calendar-question' },
      { title: 'Venue Management', description: 'Keep venue context, access notes, and job history attached to the work.', icon: 'mdi-office-building-marker-outline' },
      { title: 'Estimates', description: 'Build clear event scopes with packages, options, and pricing.', icon: 'mdi-file-document-edit-outline' },
      { title: 'Scheduling', description: 'Plan install and strike windows around event deadlines.', icon: 'mdi-calendar-clock' },
      { title: 'Installation', description: 'Give crews the instructions and materials they need on site.', icon: 'mdi-spotlight-beam' },
      { title: 'Equipment', description: 'Track what equipment is allocated, in use, and returning.', icon: 'mdi-spotlight' },
      { title: 'Crew Assignments', description: 'Staff each event with the right people at the right time.', icon: 'mdi-account-group-outline' },
      { title: 'Takedown', description: 'Close every event with planned strike and return workflows.', icon: 'mdi-calendar-remove' },
      { title: 'Billing', description: 'Connect deposits, invoices, and balances to the event job.', icon: 'mdi-cash-check' }
    ],
    outcomes: [
      'Reduce missed details between sales and field execution',
      'Coordinate install and strike around hard event deadlines',
      'Keep equipment and crew assignments visible',
      'Bill cleanly against completed event work'
    ],
    relatedModules: [
      { label: 'Estimating', to: '/estimating' },
      { label: 'Scheduling', to: '/scheduling' },
      { label: 'Field', to: '/field' },
      { label: 'Payments', to: '/payments' }
    ]
  },
  'permanent-lighting': {
    path: '/solutions/permanent-lighting',
    eyebrow: 'Permanent Lighting',
    title: 'Manage permanent lighting projects with long-term clarity.',
    description:
      'Handle leads, property details, estimates, installation scheduling, project management, crews, service, warranty tracking, and customer history across the full project lifecycle.',
    seoTitle: 'Permanent Lighting Project Software',
    audience: 'Built for permanent and architectural lighting contractors who need project continuity beyond a single season.',
    highlights: [
      { title: 'Leads', description: 'Qualify permanent lighting opportunities with clear next steps.', icon: 'mdi-account-plus-outline' },
      { title: 'Property Details', description: 'Keep site context, photos, and notes attached to the project.', icon: 'mdi-home-city-outline' },
      { title: 'Estimates', description: 'Price permanent work with accurate scope and options.', icon: 'mdi-clipboard-text-outline' },
      { title: 'Installation Scheduling', description: 'Plan installs around access windows and crew availability.', icon: 'mdi-calendar-start' },
      { title: 'Project Management', description: 'Track progress from approval through completion.', icon: 'mdi-clipboard-flow-outline' },
      { title: 'Crew Management', description: 'Assign crews with the instructions and materials they need.', icon: 'mdi-account-hard-hat' },
      { title: 'Service', description: 'Support post-install service without losing project history.', icon: 'mdi-lifebuoy' },
      { title: 'Warranty Tracking', description: 'Maintain warranty context for future service and trust.', icon: 'mdi-shield-check-outline' },
      { title: 'Customer History', description: 'Preserve the full relationship across projects and service visits.', icon: 'mdi-history' }
    ],
    outcomes: [
      'Keep property and project context together from estimate to install',
      'Coordinate crews with clearer job packages',
      'Support service and warranty with durable records',
      'Build long-term customer relationships — not one-off jobs'
    ],
    relatedModules: [
      { label: 'CRM', to: '/crm' },
      { label: 'Proposals', to: '/proposals' },
      { label: 'Field', to: '/field' },
      { label: 'Service', to: '/service' }
    ]
  }
}

export const solutionsIndexCards = [
  {
    key: 'holiday-lighting',
    title: 'Holiday Lighting',
    description: 'Seasonal leads, installs, takedowns, storage, and renewals — end to end.',
    to: '/solutions/holiday-lighting',
    icon: 'mdi-pine-tree'
  },
  {
    key: 'event-lighting',
    title: 'Event Lighting',
    description: 'Venue jobs, equipment, crews, install/strike windows, and billing.',
    to: '/solutions/event-lighting',
    icon: 'mdi-spotlight-beam'
  },
  {
    key: 'permanent-lighting',
    title: 'Permanent Lighting',
    description: 'Project lifecycle, service history, warranty context, and long-term accounts.',
    to: '/solutions/permanent-lighting',
    icon: 'mdi-wall'
  }
] as const
