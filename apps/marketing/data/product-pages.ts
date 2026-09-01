export type ProductFeature = {
  title: string
  description: string
  icon: string
}

export type ProductPageContent = {
  path: string
  eyebrow: string
  title: string
  description: string
  seoTitle: string
  features: ProductFeature[]
  previewTitle: string
  previewItems: string[]
  secondaryCta?: { label: string; to: string }
}

export const productPages: Record<string, ProductPageContent> = {
  features: {
    path: '/features',
    eyebrow: 'Product',
    title: 'Everything you need to run from lead to lights.',
    description:
      'LightForge is the operating platform for professional lighting companies — CRM, estimating, scheduling, field, inventory, service, takedowns, renewals, payments, and analytics in one system.',
    seoTitle: 'Features | Software for Professional Lighting Companies',
    previewTitle: 'Platform modules',
    previewItems: [
      'Sales & CRM',
      'Estimating & Proposals',
      'Scheduling & Crews',
      'LightForge Field',
      'Inventory & Storage',
      'Customer Portal',
      'Service & Takedowns',
      'Payments & Analytics'
    ],
    features: [
      {
        title: 'CRM & Leads',
        description: 'Capture inquiries, track opportunities, and convert more leads into installs.',
        icon: 'mdi-account-group-outline'
      },
      {
        title: 'Estimating & Proposals',
        description: 'Build packages, options, and customer-ready proposals that close faster.',
        icon: 'mdi-file-document-edit-outline'
      },
      {
        title: 'Scheduling',
        description: 'Own install, service, and takedown calendars with crew workload visibility.',
        icon: 'mdi-calendar-month-outline'
      },
      {
        title: 'Field Operations',
        description: 'Give crews jobs, navigation, instructions, materials, photos, and completion tools.',
        icon: 'mdi-cellphone-check'
      },
      {
        title: 'Inventory',
        description: 'Know where materials live — warehouses, jobs, returns, damage, and customer storage.',
        icon: 'mdi-warehouse'
      },
      {
        title: 'Customer Portal',
        description: 'Let customers approve proposals, pay deposits, request service, and renew.',
        icon: 'mdi-account-box-outline'
      },
      {
        title: 'Service & Takedowns',
        description: 'Handle service tickets and end-of-season removals without losing schedule control.',
        icon: 'mdi-wrench-outline'
      },
      {
        title: 'Payments & Analytics',
        description: 'Track deposits, balances, seasonal revenue, conversion, and crew performance.',
        icon: 'mdi-chart-box-outline'
      }
    ]
  },
  crm: {
    path: '/crm',
    eyebrow: 'CRM',
    title: 'Turn More Leads Into Installations.',
    description:
      'LightForge CRM is built for lighting sales cycles — from first inquiry through follow-ups, property details, and closed jobs.',
    seoTitle: 'Holiday Lighting CRM & Operations Software',
    previewTitle: 'CRM workspace preview',
    previewItems: [
      'Open leads by source',
      'Pipeline stages',
      'Customer & property records',
      'Follow-up tasks',
      'Communication history',
      'Sales analytics'
    ],
    secondaryCta: { label: 'See Estimating', to: '/estimating' },
    features: [
      { title: 'Lead Capture', description: 'Intake leads from forms, referrals, and campaigns into one queue.', icon: 'mdi-inbox-arrow-down-outline' },
      { title: 'Customer Records', description: 'Keep contacts, properties, notes, and history together.', icon: 'mdi-card-account-details-outline' },
      { title: 'Sales Pipeline', description: 'Move opportunities from lead to won with clear stage visibility.', icon: 'mdi-pipe' },
      { title: 'Opportunity Tracking', description: 'Track job value, probability, and next actions.', icon: 'mdi-target' },
      { title: 'Follow-Ups', description: 'Never lose a warm lead with scheduled reminders and tasks.', icon: 'mdi-bell-ring-outline' },
      { title: 'Notes', description: 'Capture call notes, site details, and internal context.', icon: 'mdi-note-text-outline' },
      { title: 'Communication History', description: 'See the conversation trail that led to the sale.', icon: 'mdi-message-text-outline' },
      { title: 'Lead Sources', description: 'Understand which channels produce installs — not just clicks.', icon: 'mdi-chart-timeline-variant' },
      { title: 'Automations', description: 'Assign reps, confirm inquiries, and create follow-ups automatically.', icon: 'mdi-robot-outline' },
      { title: 'Sales Analytics', description: 'Measure conversion, close rate, and pipeline health.', icon: 'mdi-chart-line' }
    ]
  },
  estimating: {
    path: '/estimating',
    eyebrow: 'Estimating',
    title: 'Build Better Estimates. Close Faster.',
    description:
      'Create lighting packages, custom pricing, and property-aware estimates that turn into polished proposals and deposits.',
    seoTitle: 'Lighting Estimating & Proposal Software',
    previewTitle: 'Estimate builder preview',
    previewItems: [
      'Package line items',
      'Property photos',
      'Measurements & notes',
      'Add-on options',
      'Totals & deposits',
      'Send for approval'
    ],
    secondaryCta: { label: 'See Proposals', to: '/proposals' },
    features: [
      { title: 'Lighting Packages', description: 'Standardize offerings without losing room for customization.', icon: 'mdi-package-variant-closed' },
      { title: 'Custom Pricing', description: 'Price by package, option, add-on, or fully custom scope.', icon: 'mdi-currency-usd' },
      { title: 'Property Information', description: 'Attach address, access notes, and site context to every estimate.', icon: 'mdi-home-map-marker' },
      { title: 'Photos', description: 'Include site photos so pricing and proposals stay grounded in reality.', icon: 'mdi-image-multiple-outline' },
      { title: 'Measurements', description: 'Capture the details that drive accurate lighting quotes.', icon: 'mdi-ruler-square' },
      { title: 'Proposal Builder', description: 'Turn estimates into customer-ready proposals in one flow.', icon: 'mdi-file-cabinet' },
      { title: 'Add-On Options', description: 'Offer upgrades that increase job value without confusing the quote.', icon: 'mdi-plus-box-outline' },
      { title: 'Digital Approval', description: 'Send for review and acceptance without email chaos.', icon: 'mdi-check-decagram-outline' },
      { title: 'Electronic Signature', description: 'Collect signatures that move work into production.', icon: 'mdi-draw' },
      { title: 'Deposits', description: 'Request deposits as soon as the proposal is approved.', icon: 'mdi-cash-plus' }
    ]
  },
  proposals: {
    path: '/proposals',
    eyebrow: 'Proposals',
    title: 'Proposals Built to Sell.',
    description:
      'Deliver clear, professional proposals with packages, upgrades, scope, pricing, acceptance, and deposit requests — designed for lighting buyers.',
    seoTitle: 'Lighting Proposal Software',
    previewTitle: 'Proposal preview',
    previewItems: [
      'Customer & property info',
      'Service packages',
      'Optional upgrades',
      'Photos & scope',
      'Pricing & terms',
      'Signature & deposit'
    ],
    secondaryCta: { label: 'See Scheduling', to: '/scheduling' },
    features: [
      { title: 'Customer Information', description: 'Keep buyer details visible and accurate on every proposal.', icon: 'mdi-account-outline' },
      { title: 'Property Information', description: 'Show the property being lit — not a generic quote.', icon: 'mdi-home-outline' },
      { title: 'Service Packages', description: 'Present clear package options customers can compare.', icon: 'mdi-view-agenda-outline' },
      { title: 'Optional Upgrades', description: 'Make upsells easy to understand and easy to accept.', icon: 'mdi-arrow-up-bold-box-outline' },
      { title: 'Photos', description: 'Help customers visualize the work with site imagery.', icon: 'mdi-camera-outline' },
      { title: 'Scope of Work', description: 'Define what is included before install day.', icon: 'mdi-clipboard-list-outline' },
      { title: 'Terms', description: 'Include commercial terms without burying the offer.', icon: 'mdi-file-document-outline' },
      { title: 'Pricing', description: 'Show totals that support confident buying decisions.', icon: 'mdi-tag-outline' },
      { title: 'Acceptance', description: 'Make approval a clear next step — not another email thread.', icon: 'mdi-thumb-up-outline' },
      { title: 'Signature & Deposit Request', description: 'Close with signature capture and deposit collection.', icon: 'mdi-file-sign' }
    ]
  },
  scheduling: {
    path: '/scheduling',
    eyebrow: 'Scheduling',
    title: 'Own Your Season.',
    description:
      'Plan installations, service, and takedowns with crew assignment, route visibility, and workload control built for lighting season intensity.',
    seoTitle: 'Lighting Business Scheduling Software',
    previewTitle: 'Season calendar preview',
    previewItems: [
      'Installation calendar',
      'Crew assignments',
      'Service windows',
      'Takedown blocks',
      'Workload balance',
      'Job status'
    ],
    secondaryCta: { label: 'Explore Field', to: '/field' },
    features: [
      { title: 'Installation Calendar', description: 'See the season at a glance and protect capacity.', icon: 'mdi-calendar-star' },
      { title: 'Drag-and-Drop Scheduling', description: 'Adjust jobs quickly as weather and priorities change.', icon: 'mdi-cursor-move' },
      { title: 'Crew Assignment', description: 'Put the right crew on the right job every day.', icon: 'mdi-account-hard-hat' },
      { title: 'Service Scheduling', description: 'Fit service calls without derailing install production.', icon: 'mdi-calendar-clock' },
      { title: 'Takedown Scheduling', description: 'Plan removals before the season ends in chaos.', icon: 'mdi-calendar-remove' },
      { title: 'Route Visibility', description: 'Reduce windshield time with clearer geographic planning.', icon: 'mdi-map-marker-path' },
      { title: 'Workload Management', description: 'Balance crews so quality and timelines hold.', icon: 'mdi-scale-balance' },
      { title: 'Job Status', description: 'Know what is scheduled, in progress, blocked, or complete.', icon: 'mdi-list-status' },
      { title: 'Weather Awareness', description: 'Plan around conditions that stop rooftop and outdoor work.', icon: 'mdi-weather-partly-cloudy' }
    ]
  },
  field: {
    path: '/field',
    eyebrow: 'LightForge Field',
    title: 'Your Crews Have Everything They Need.',
    description:
      'LightForge Field puts today’s jobs, navigation, customer details, install instructions, materials, photos, and completion tools in every crew’s hands.',
    seoTitle: 'Lighting Crew & Field Management Software',
    previewTitle: 'Field app preview',
    previewItems: [
      "Today's jobs",
      'Navigation',
      'Install instructions',
      'Design photos',
      'Material lists',
      'Checklists & completion'
    ],
    secondaryCta: { label: 'See Inventory', to: '/inventory' },
    features: [
      { title: "Today's Jobs", description: 'Give each crew a clear day plan without office phone calls.', icon: 'mdi-clipboard-check-outline' },
      { title: 'Navigation', description: 'Get crews to the right property faster.', icon: 'mdi-navigation-outline' },
      { title: 'Customer Information', description: 'Contact details and expectations available on site.', icon: 'mdi-card-account-phone-outline' },
      { title: 'Property Information', description: 'Access notes, gates, parking, and site constraints.', icon: 'mdi-home-search-outline' },
      { title: 'Installation Instructions', description: 'Carry the plan into the field — not tribal knowledge.', icon: 'mdi-book-open-page-variant-outline' },
      { title: 'Design Photos', description: 'Reference approved visuals while installing.', icon: 'mdi-image-outline' },
      { title: 'Material Lists', description: 'Know what should be on the truck before wheels roll.', icon: 'mdi-format-list-bulleted' },
      { title: 'Checklists', description: 'Standardize quality across crews and jobs.', icon: 'mdi-checkbox-marked-outline' },
      { title: 'Job Photos', description: 'Document before, during, and after work.', icon: 'mdi-camera-plus-outline' },
      { title: 'Service Issues', description: 'Log problems immediately instead of losing details later.', icon: 'mdi-alert-circle-outline' },
      { title: 'Completion Status', description: 'Close jobs cleanly with status the office can trust.', icon: 'mdi-check-circle-outline' },
      { title: 'Customer Signature', description: 'Capture completion confirmation in the field.', icon: 'mdi-draw-pen' }
    ]
  },
  inventory: {
    path: '/inventory',
    eyebrow: 'Inventory',
    title: 'Know Where Everything Is.',
    description:
      'Track inventory, warehouses, bins, job allocation, returns, damage, reorder alerts, and customer storage — built for lighting materials reality.',
    seoTitle: 'Lighting Inventory Management Software',
    previewTitle: 'Inventory preview',
    previewItems: [
      'Warehouse locations',
      'Storage bins',
      'Job allocations',
      'Returns & damage',
      'Reorder alerts',
      'Customer storage'
    ],
    secondaryCta: { label: 'Customer Portal', to: '/customer-portal' },
    features: [
      { title: 'Inventory', description: 'Maintain a living count of what you own and what is available.', icon: 'mdi-cube-outline' },
      { title: 'Warehouse Locations', description: 'Organize stock across facilities and staging areas.', icon: 'mdi-domain' },
      { title: 'Storage Bins', description: 'Find materials faster with location-level detail.', icon: 'mdi-archive-outline' },
      { title: 'Job Material Allocation', description: 'Assign materials to jobs before install day.', icon: 'mdi-truck-delivery-outline' },
      { title: 'Material Usage', description: 'See what was planned versus what was used.', icon: 'mdi-chart-bar' },
      { title: 'Returns', description: 'Bring unused materials back into inventory cleanly.', icon: 'mdi-backup-restore' },
      { title: 'Damaged Items', description: 'Track damage so losses do not disappear into the season.', icon: 'mdi-alert-octagon-outline' },
      { title: 'Reorder Alerts', description: 'Know what to replenish before crews run short.', icon: 'mdi-bell-alert-outline' },
      { title: 'Seasonal Counts', description: 'Support pre-season and post-season inventory discipline.', icon: 'mdi-counter' },
      { title: 'Customer Storage Assignments', description: 'Track what belongs to which customer between seasons.', icon: 'mdi-account-box-multiple-outline' }
    ]
  },
  'customer-portal': {
    path: '/customer-portal',
    eyebrow: 'Customer Portal',
    title: 'Give Customers a Better Experience.',
    description:
      'A customer-facing portal for approvals, deposits, invoices, project status, messages, service requests, photos, and renewals.',
    seoTitle: 'Lighting Customer Portal Software',
    previewTitle: 'Portal preview',
    previewItems: [
      'Proposal approval',
      'Deposits & invoices',
      'Project status',
      'Messages',
      'Service requests',
      'Renewal options'
    ],
    secondaryCta: { label: 'See Payments', to: '/payments' },
    features: [
      { title: 'Estimate Approval', description: 'Let customers review and approve without endless email.', icon: 'mdi-file-check-outline' },
      { title: 'Proposals', description: 'Present the offer clearly in a branded customer experience.', icon: 'mdi-file-star-outline' },
      { title: 'Contracts', description: 'Keep agreements accessible after acceptance.', icon: 'mdi-file-certificate-outline' },
      { title: 'Deposits', description: 'Collect deposits as part of the approval flow.', icon: 'mdi-cash-lock' },
      { title: 'Invoices', description: 'Share balances and payment history transparently.', icon: 'mdi-receipt-text-outline' },
      { title: 'Payments', description: 'Make it easy for customers to pay on time.', icon: 'mdi-credit-card-outline' },
      { title: 'Project Status', description: 'Reduce “where are we?” calls with visible progress.', icon: 'mdi-progress-check' },
      { title: 'Messages', description: 'Centralize customer communication around the job.', icon: 'mdi-chat-outline' },
      { title: 'Service Requests', description: 'Let customers report issues the right way.', icon: 'mdi-lifebuoy' },
      { title: 'Installation Photos', description: 'Share finished work and documentation securely.', icon: 'mdi-image-album' },
      { title: 'Renewal Options', description: 'Invite customers back for next season with prior context.', icon: 'mdi-autorenew' }
    ]
  },
  payments: {
    path: '/payments',
    eyebrow: 'Payments',
    title: 'Deposits to Final Payment.',
    description:
      'Manage deposits, invoices, outstanding balances, and seasonal cash flow without disconnecting finance from operations.',
    seoTitle: 'Lighting Business Payments & Invoicing',
    previewTitle: 'Payments preview',
    previewItems: [
      'Deposit requests',
      'Open invoices',
      'Outstanding balances',
      'Payment status',
      'Job-linked billing',
      'Season cash view'
    ],
    secondaryCta: { label: 'See Analytics', to: '/analytics' },
    features: [
      { title: 'Estimates to Invoices', description: 'Carry pricing forward so billing matches what was sold.', icon: 'mdi-swap-horizontal' },
      { title: 'Deposits', description: 'Secure the job with deposits tied to approvals.', icon: 'mdi-piggy-bank-outline' },
      { title: 'Invoices', description: 'Generate balances as work progresses or completes.', icon: 'mdi-file-table-box-outline' },
      { title: 'Payments', description: 'Track what has been paid and what is still open.', icon: 'mdi-cash-check' },
      { title: 'Outstanding Balances', description: 'See receivables before they become end-of-season surprises.', icon: 'mdi-scale-unbalanced' },
      { title: 'Job-Linked Billing', description: 'Connect money to the jobs, crews, and customers behind it.', icon: 'mdi-link-variant' },
      { title: 'Customer Portal Payments', description: 'Let customers pay through the portal experience.', icon: 'mdi-monitor-cellphone' },
      { title: 'Seasonal Cash Visibility', description: 'Understand deposits, installs, and collections across the season.', icon: 'mdi-chart-areaspline' }
    ]
  },
  service: {
    path: '/service',
    eyebrow: 'Service',
    title: 'Handle Service Without Losing Control of the Schedule.',
    description:
      'Intake customer service requests, assign crews, notify customers, document repairs, and resolve issues without derailing install production.',
    seoTitle: 'Lighting Service Management Software',
    previewTitle: 'Service desk preview',
    previewItems: [
      'Open service requests',
      'Trouble tickets',
      'Crew assignment',
      'Customer notifications',
      'Before / after photos',
      'Resolution tracking'
    ],
    secondaryCta: { label: 'See Takedowns', to: '/takedowns' },
    features: [
      { title: 'Customer Service Requests', description: 'Capture issues from portal, phone, or office intake in one queue.', icon: 'mdi-lifebuoy' },
      { title: 'Trouble Tickets', description: 'Track each problem with ownership, urgency, and status.', icon: 'mdi-ticket-outline' },
      { title: 'Service Scheduling', description: 'Fit repairs into the calendar without collapsing install capacity.', icon: 'mdi-calendar-clock' },
      { title: 'Crew Assignment', description: 'Send the right crew with the right context.', icon: 'mdi-account-hard-hat' },
      { title: 'Customer Notifications', description: 'Keep customers informed as work is scheduled and completed.', icon: 'mdi-bell-ring-outline' },
      { title: 'Repair Notes', description: 'Document what failed, what was fixed, and what remains.', icon: 'mdi-note-edit-outline' },
      { title: 'Before Photos', description: 'Record the issue clearly before work begins.', icon: 'mdi-camera-outline' },
      { title: 'After Photos', description: 'Prove resolution and support quality review.', icon: 'mdi-camera-plus-outline' },
      { title: 'Resolution Tracking', description: 'Close tickets with outcomes the office can audit.', icon: 'mdi-check-decagram-outline' },
      { title: 'Repeat Issue Tracking', description: 'Spot recurring problems before they become reputation risks.', icon: 'mdi-replay' }
    ]
  },
  takedowns: {
    path: '/takedowns',
    eyebrow: 'Takedowns',
    title: 'Takedowns Without the Chaos.',
    description:
      'Takedown management is a LightForge differentiator — automatic removal jobs, calendars, routes, returns, storage, and damage reporting built for end-of-season reality.',
    seoTitle: 'Holiday Lighting Takedown Software',
    previewTitle: 'Takedown operations preview',
    previewItems: [
      'Auto-created removal jobs',
      'Removal calendar',
      'Crew & route planning',
      'Customer notifications',
      'Material returns',
      'Storage assignment'
    ],
    secondaryCta: { label: 'See Renewals', to: '/renewals' },
    features: [
      { title: 'Automatic Takedown Job Creation', description: 'Generate removal work from installed jobs instead of rebuilding lists by hand.', icon: 'mdi-auto-fix' },
      { title: 'Removal Calendar', description: 'Plan the post-season with the same discipline as install season.', icon: 'mdi-calendar-remove' },
      { title: 'Crew Assignment', description: 'Deploy crews efficiently across dense takedown weeks.', icon: 'mdi-account-group-outline' },
      { title: 'Route Planning', description: 'Reduce drive time when every property needs a visit again.', icon: 'mdi-map-marker-path' },
      { title: 'Customer Notifications', description: 'Tell customers when removals are scheduled and complete.', icon: 'mdi-message-badge-outline' },
      { title: 'Material Returns', description: 'Bring company materials back into inventory cleanly.', icon: 'mdi-backup-restore' },
      { title: 'Storage Assignment', description: 'Assign customer-owned materials to the right storage location.', icon: 'mdi-archive-outline' },
      { title: 'Damage Reporting', description: 'Capture damage before it disappears between seasons.', icon: 'mdi-alert-octagon-outline' },
      { title: 'Job Completion', description: 'Close removals with status, notes, and photo evidence.', icon: 'mdi-clipboard-check-outline' }
    ]
  },
  renewals: {
    path: '/renewals',
    eyebrow: 'Renewals',
    title: 'Turn This Season Into Next Season.',
    description:
      'Track returning customers, prior-year pricing, early campaigns, upsells, and renewal reporting so next season starts with momentum — not a cold pipeline.',
    seoTitle: 'Lighting Business Renewal Software',
    previewTitle: 'Renewal pipeline preview',
    previewItems: [
      'Returning customers',
      'Prior-year pricing',
      'Early renewal campaigns',
      'Upsell opportunities',
      'Automated follow-up',
      'Renewal reporting'
    ],
    secondaryCta: { label: 'See Marketing', to: '/marketing' },
    features: [
      { title: 'Renewal Tracking', description: 'Know who is due back and where each renewal stands.', icon: 'mdi-progress-clock' },
      { title: 'Returning Customers', description: 'Prioritize customers with install history and storage on file.', icon: 'mdi-account-heart-outline' },
      { title: 'Automated Follow-Up', description: 'Trigger outreach before the buying window closes.', icon: 'mdi-robot-outline' },
      { title: 'Previous-Year Pricing', description: 'Start from last season’s numbers instead of rebuilding every quote.', icon: 'mdi-history' },
      { title: 'Repricing', description: 'Adjust for material, labor, and package changes with control.', icon: 'mdi-currency-usd' },
      { title: 'Upsells', description: 'Offer upgrades based on what was installed before.', icon: 'mdi-arrow-up-bold-box-outline' },
      { title: 'Add-On Services', description: 'Expand scope with add-ons customers already trust you to deliver.', icon: 'mdi-plus-box-outline' },
      { title: 'Early Renewal Campaigns', description: 'Fill the calendar earlier with proactive renewal pushes.', icon: 'mdi-megaphone-outline' },
      { title: 'Renewal Reporting', description: 'Measure retention, conversion, and next-season pipeline health.', icon: 'mdi-chart-line' }
    ]
  },
  marketing: {
    path: '/marketing',
    eyebrow: 'Marketing',
    title: 'Seasonal Marketing That Feeds the Pipeline.',
    description:
      'Connect outreach and campaign activity to lighting leads, follow-ups, and install opportunities — so marketing effort becomes booked work.',
    seoTitle: 'Lighting Business Marketing Software',
    previewTitle: 'Campaign workflow preview',
    previewItems: [
      'Lead capture',
      'Campaign follow-up',
      'Sales assignment',
      'Opportunity creation',
      'Seasonal timing',
      'Pipeline impact'
    ],
    secondaryCta: { label: 'See CRM', to: '/crm' },
    features: [
      { title: 'Lead Intake', description: 'Bring campaign responses into CRM without spreadsheet handoffs.', icon: 'mdi-inbox-arrow-down-outline' },
      { title: 'Seasonal Campaign Timing', description: 'Align outreach with pre-season, install, and renewal windows.', icon: 'mdi-calendar-star' },
      { title: 'Follow-Up Workflows', description: 'Keep prospects moving after the first inquiry.', icon: 'mdi-transit-connection-variant' },
      { title: 'Sales Handoff', description: 'Assign reps and create opportunities automatically where appropriate.', icon: 'mdi-handshake-outline' },
      { title: 'Customer Re-Engagement', description: 'Reconnect prior customers for renewals and add-ons.', icon: 'mdi-email-newsletter' },
      { title: 'Source Visibility', description: 'See which campaigns produce installs — not just form fills.', icon: 'mdi-chart-timeline-variant' },
      { title: 'Message Consistency', description: 'Keep brand and offer messaging consistent across touchpoints.', icon: 'mdi-message-draw' },
      { title: 'Pipeline Connection', description: 'Tie marketing activity to estimating and scheduling outcomes.', icon: 'mdi-pipe' }
    ]
  },
  analytics: {
    path: '/analytics',
    eyebrow: 'Analytics',
    title: 'Know Your Numbers.',
    description:
      'See seasonal revenue, conversion, crew performance, material usage, outstanding balances, and renewal rate with dashboards built for lighting operations.',
    seoTitle: 'Lighting Business Analytics & Reporting',
    previewTitle: 'Analytics dashboard preview',
    previewItems: [
      'Seasonal revenue',
      'Lead & estimate conversion',
      'Average job value',
      'Crew performance',
      'Service call rate',
      'Renewal rate'
    ],
    secondaryCta: { label: 'See Integrations', to: '/integrations' },
    features: [
      { title: 'Seasonal Revenue', description: 'Track revenue across the season — not just monthly snapshots.', icon: 'mdi-cash-multiple' },
      { title: 'Revenue by Month', description: 'Spot pacing issues early while there is still time to correct.', icon: 'mdi-chart-bar' },
      { title: 'Revenue by Service', description: 'Understand which offerings drive the business.', icon: 'mdi-chart-pie' },
      { title: 'Lead Conversion', description: 'Measure inquiry-to-opportunity performance.', icon: 'mdi-chart-timeline-variant-shimmer' },
      { title: 'Estimate & Proposal Conversion', description: 'See where quotes stall and where they close.', icon: 'mdi-file-percent-outline' },
      { title: 'Average Job Value', description: 'Monitor package mix and upsell effectiveness.', icon: 'mdi-tag-text-outline' },
      { title: 'Crew Performance', description: 'Evaluate throughput and completion quality by crew.', icon: 'mdi-account-hard-hat' },
      { title: 'Installation Volume', description: 'Track install capacity utilization through peak weeks.', icon: 'mdi-ladder' },
      { title: 'Service Call Rate', description: 'Watch service load relative to installs completed.', icon: 'mdi-wrench-outline' },
      { title: 'Material Usage', description: 'Connect inventory consumption to job activity.', icon: 'mdi-cube-outline' },
      { title: 'Outstanding Balances', description: 'Keep collections visible alongside operations.', icon: 'mdi-scale-unbalanced' },
      { title: 'Renewal Rate', description: 'Measure how well this season becomes next season.', icon: 'mdi-autorenew' }
    ]
  },
  integrations: {
    path: '/integrations',
    eyebrow: 'Integrations',
    title: 'Connect the tools your lighting business already uses.',
    description:
      'LightForge is preparing integration categories for payments, accounting, email, SMS, calendars, mapping, forms, and storage. Only live integrations will be listed as supported.',
    seoTitle: 'LightForge Integrations',
    previewTitle: 'Integration categories',
    previewItems: [
      'Payments — planned',
      'Accounting — planned',
      'Email — planned',
      'SMS — planned',
      'Calendars — planned',
      'Mapping — planned',
      'Forms — planned',
      'Storage — planned'
    ],
    secondaryCta: { label: 'Contact Us', to: '/contact' },
    features: [
      { title: 'Payments', description: 'Planned connections for deposit and invoice collection workflows.', icon: 'mdi-credit-card-outline' },
      { title: 'Accounting', description: 'Planned pathways to keep operational billing aligned with books.', icon: 'mdi-book-open-outline' },
      { title: 'Email', description: 'Planned email delivery and conversation sync options.', icon: 'mdi-email-outline' },
      { title: 'SMS', description: 'Planned texting for reminders, status updates, and crew communication.', icon: 'mdi-message-processing-outline' },
      { title: 'Calendars', description: 'Planned calendar sync for office and field coordination.', icon: 'mdi-calendar-sync' },
      { title: 'Mapping', description: 'Planned mapping support for routing and property context.', icon: 'mdi-map-outline' },
      { title: 'Forms', description: 'Planned lead and intake form connections into CRM.', icon: 'mdi-form-select' },
      { title: 'Storage', description: 'Planned file and media storage connections for photos and documents.', icon: 'mdi-cloud-outline' }
    ]
  }
}
