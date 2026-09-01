export function buildDemoSeed(): Record<string, Array<Record<string, unknown>>> {
  return {
    customers: [
      {
        name: 'Anderson Residence',
        type: 'residential',
        email: 'sarah.anderson@example.com',
        phone: '555-201-4401',
        status: 'active',
        tags: 'holiday,recurring',
        notes: 'Prefers warm white C9 on roofline'
      },
      {
        name: 'Maple Grove HOA',
        type: 'commercial',
        email: 'office@maplegrovehoa.example',
        phone: '555-201-4410',
        status: 'active',
        tags: 'hoa,commercial',
        notes: 'Multi-property contract for common areas'
      },
      {
        name: 'Riverfront Bistro',
        type: 'commercial',
        email: 'events@riverfrontbistro.example',
        phone: '555-201-4422',
        status: 'lead',
        tags: 'storefront',
        notes: 'Interested in patio icicle package'
      }
    ],
    properties: [
      {
        name: 'Anderson Main Home',
        customerName: 'Anderson Residence',
        address: '412 Cedar Lane',
        city: 'Greenville',
        state: 'SC',
        zip: '29601',
        serviceNotes: 'Ladder access on south side; pets indoors'
      },
      {
        name: 'Maple Grove Clubhouse',
        customerName: 'Maple Grove HOA',
        address: '88 Maple Grove Dr',
        city: 'Greenville',
        state: 'SC',
        zip: '29607',
        serviceNotes: 'Gate code 4412; install after 5pm'
      },
      {
        name: 'Riverfront Patio',
        customerName: 'Riverfront Bistro',
        address: '15 River St',
        city: 'Greenville',
        state: 'SC',
        zip: '29601',
        serviceNotes: 'Work after close; manager on site'
      }
    ],
    contacts: [
      {
        name: 'Sarah Anderson',
        customerName: 'Anderson Residence',
        email: 'sarah.anderson@example.com',
        phone: '555-201-4401',
        role: 'Homeowner'
      },
      {
        name: 'Tom Briggs',
        customerName: 'Maple Grove HOA',
        email: 'tbriggs@maplegrovehoa.example',
        phone: '555-201-4411',
        role: 'Board president'
      },
      {
        name: 'Elena Ruiz',
        customerName: 'Riverfront Bistro',
        email: 'elena@riverfrontbistro.example',
        phone: '555-201-4423',
        role: 'Events manager'
      }
    ],
    mockups: [
      {
        title: 'Anderson warm white roofline',
        propertyName: 'Anderson Main Home',
        status: 'approved',
        assetUrl: 'https://cdn.example.com/mockups/anderson-roofline.png',
        notes: 'Approved for install week of Nov 10'
      },
      {
        title: 'Clubhouse tree wrap concept',
        propertyName: 'Maple Grove Clubhouse',
        status: 'shared',
        assetUrl: 'https://cdn.example.com/mockups/hoa-trees.png',
        notes: 'Awaiting board vote'
      },
      {
        title: 'Bistro patio icicles',
        propertyName: 'Riverfront Patio',
        status: 'draft',
        assetUrl: '',
        notes: 'Draft for proposal meeting'
      }
    ],
    proposals: [
      {
        title: 'Anderson 2026 Holiday Package',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        amountCents: 185000,
        status: 'accepted',
        notes: 'Includes install, mid-season service, takedown'
      },
      {
        title: 'Maple Grove Common Areas',
        customerName: 'Maple Grove HOA',
        propertyName: 'Maple Grove Clubhouse',
        amountCents: 920000,
        status: 'sent',
        notes: '3-year term option included'
      },
      {
        title: 'Riverfront Patio Glow',
        customerName: 'Riverfront Bistro',
        propertyName: 'Riverfront Patio',
        amountCents: 275000,
        status: 'draft',
        notes: 'Commercial outlet survey pending'
      }
    ],
    commercialAccounts: [
      {
        name: 'Maple Grove HOA Master',
        contactName: 'Tom Briggs',
        contractValueCents: 920000,
        status: 'active',
        notes: 'Seasonal lighting for clubhouse and entrances'
      },
      {
        name: 'Riverfront Hospitality Group',
        contactName: 'Elena Ruiz',
        contractValueCents: 275000,
        status: 'prospect',
        notes: 'May expand to sister location downtown'
      },
      {
        name: 'Summit Retail Plaza',
        contactName: 'Chris Nolan',
        contractValueCents: 0,
        status: 'churned',
        notes: 'Did not renew after 2024 season'
      }
    ],
    rebookingRequests: [
      {
        customerName: 'Anderson Residence',
        priorJobTitle: 'Anderson 2025 Install',
        requestedDate: '2026-11-08',
        status: 'booked',
        notes: 'Same package as last year'
      },
      {
        customerName: 'Maple Grove HOA',
        priorJobTitle: 'Clubhouse 2025 Display',
        requestedDate: '2026-11-01',
        status: 'contacted',
        notes: 'Wants earlier install window'
      },
      {
        customerName: 'Chen Residence',
        priorJobTitle: 'Chen Roofline 2025',
        requestedDate: '2026-11-15',
        status: 'new',
        notes: 'Left voicemail'
      }
    ],
    jobs: [
      {
        title: 'Anderson Holiday Install',
        propertyName: 'Anderson Main Home',
        type: 'install',
        status: 'scheduled',
        scheduledDate: '2026-11-10',
        crewNotes: 'Bring C9 warm white and clips for architectural shingles'
      },
      {
        title: 'Maple Grove Clubhouse Install',
        propertyName: 'Maple Grove Clubhouse',
        type: 'install',
        status: 'lead',
        scheduledDate: '2026-11-03',
        crewNotes: 'Two crews; lift required for trees'
      },
      {
        title: 'Anderson Mid-season Service',
        propertyName: 'Anderson Main Home',
        type: 'service',
        status: 'lead',
        scheduledDate: '2026-12-20',
        crewNotes: 'Check failed sections after storms'
      }
    ],
    projectPrep: [
      {
        jobTitle: 'Anderson Holiday Install',
        item: 'Stage warm white C9 spools',
        status: 'done',
        notes: 'Warehouse bay A2'
      },
      {
        jobTitle: 'Anderson Holiday Install',
        item: 'Confirm homeowner on-site window',
        status: 'todo',
        notes: 'Call Sarah Monday'
      },
      {
        jobTitle: 'Maple Grove Clubhouse Install',
        item: 'Reserve 40ft boom lift',
        status: 'blocked',
        notes: 'Waiting on rental confirmation'
      }
    ],
    scheduleEvents: [
      {
        title: 'Anderson Install Day',
        jobTitle: 'Anderson Holiday Install',
        date: '2026-11-10',
        startTime: '08:00',
        crew: 'Crew Alpha',
        notes: 'Half-day residential'
      },
      {
        title: 'HOA Site Walk',
        jobTitle: 'Maple Grove Clubhouse Install',
        date: '2026-10-28',
        startTime: '16:00',
        crew: 'Sales + Ops',
        notes: 'Measure entrances'
      },
      {
        title: 'Warehouse Pull Day',
        jobTitle: 'Anderson Holiday Install',
        date: '2026-11-09',
        startTime: '13:00',
        crew: 'Warehouse',
        notes: 'Pull and label by property'
      }
    ],
    routes: [
      {
        name: 'North Greenville Nov 10',
        date: '2026-11-10',
        stops: 'Anderson Main Home, Chen Residence, Patel Estate',
        driver: 'Marcus Lee',
        status: 'planned'
      },
      {
        name: 'HOA Corridor Nov 3',
        date: '2026-11-03',
        stops: 'Maple Grove Clubhouse, Maple Grove North Gate',
        driver: 'Alicia Brooks',
        status: 'planned'
      },
      {
        name: 'Service Sweep Dec 20',
        date: '2026-12-20',
        stops: 'Anderson Main Home, Riverfront Patio',
        driver: 'Marcus Lee',
        status: 'planned'
      }
    ],
    serviceIssues: [
      {
        title: 'Section out on front gable',
        propertyName: 'Anderson Main Home',
        jobTitle: 'Anderson Mid-season Service',
        priority: 'medium',
        status: 'open',
        notes: 'Homeowner reported after wind storm'
      },
      {
        title: 'Controller reset needed',
        propertyName: 'Maple Grove Clubhouse',
        jobTitle: 'Maple Grove Clubhouse Install',
        priority: 'low',
        status: 'in_progress',
        notes: 'Timer drifted after power blip'
      },
      {
        title: 'Broken clip on patio rail',
        propertyName: 'Riverfront Patio',
        jobTitle: '',
        priority: 'high',
        status: 'resolved',
        notes: 'Replaced during walkthrough'
      }
    ],
    timeEntries: [
      {
        userName: 'Marcus Lee',
        jobTitle: 'Anderson Holiday Install',
        clockIn: '2026-11-10T08:05:00',
        clockOut: '2026-11-10T12:30:00',
        hours: 4.4,
        notes: 'Install complete'
      },
      {
        userName: 'Alicia Brooks',
        jobTitle: 'Maple Grove Clubhouse Install',
        clockIn: '2026-10-28T15:50:00',
        clockOut: '2026-10-28T17:40:00',
        hours: 1.8,
        notes: 'Site walk'
      },
      {
        userName: 'Devon Price',
        jobTitle: 'Warehouse Pull Day',
        clockIn: '2026-11-09T13:00:00',
        clockOut: '2026-11-09T16:15:00',
        hours: 3.3,
        notes: 'Pulled Anderson materials'
      }
    ],
    customerStorage: [
      {
        itemName: 'Warm white C9 custom runs',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        quantity: 12,
        location: 'Rack B-14',
        notes: 'Labeled by elevation'
      },
      {
        itemName: 'HOA tree wrap nets',
        customerName: 'Maple Grove HOA',
        propertyName: 'Maple Grove Clubhouse',
        quantity: 8,
        location: 'Bay C',
        notes: 'Store dry; check for tears'
      },
      {
        itemName: 'Patio icicle strands',
        customerName: 'Riverfront Bistro',
        propertyName: 'Riverfront Patio',
        quantity: 24,
        location: 'Rack D-02',
        notes: 'Commercial grade'
      }
    ],
    inventoryItems: [
      {
        sku: 'C9-WW-25',
        name: 'C9 Warm White 25ct',
        quantity: 420,
        reorderLevel: 100,
        location: 'Aisle 1',
        notes: 'Primary residential SKU'
      },
      {
        sku: 'CLIP-ARCH-100',
        name: 'Architectural shingle clips 100pk',
        quantity: 85,
        reorderLevel: 40,
        location: 'Aisle 3',
        notes: ''
      },
      {
        sku: 'CTRL-WIFI-4Z',
        name: 'WiFi 4-zone controller',
        quantity: 18,
        reorderLevel: 10,
        location: 'Cage',
        notes: 'Keep serialized'
      }
    ],
    invoices: [
      {
        number: 'INV-2026-1042',
        customerName: 'Anderson Residence',
        jobTitle: 'Anderson Holiday Install',
        amountCents: 185000,
        status: 'paid',
        dueDate: '2026-11-01',
        notes: 'Deposit + balance paid'
      },
      {
        number: 'INV-2026-1108',
        customerName: 'Maple Grove HOA',
        jobTitle: 'Maple Grove Clubhouse Install',
        amountCents: 460000,
        status: 'sent',
        dueDate: '2026-11-15',
        notes: '50% deposit invoice'
      },
      {
        number: 'INV-2026-1120',
        customerName: 'Riverfront Bistro',
        jobTitle: '',
        amountCents: 50000,
        status: 'draft',
        dueDate: '2026-11-20',
        notes: 'Design retainer'
      }
    ],
    messages: [
      {
        to: 'sarah.anderson@example.com',
        channel: 'email',
        subject: 'Install confirmed for Nov 10',
        body: 'Your holiday lighting install is scheduled for November 10 starting at 8am.',
        status: 'sent'
      },
      {
        to: '555-201-4411',
        channel: 'sms',
        subject: '',
        body: 'Maple Grove site walk confirmed for Oct 28 at 4pm.',
        status: 'sent'
      },
      {
        to: 'elena@riverfrontbistro.example',
        channel: 'email',
        subject: 'Draft proposal ready',
        body: 'Attached is the patio lighting draft proposal for review.',
        status: 'draft'
      }
    ],
    reviews: [
      {
        customerName: 'Anderson Residence',
        rating: 5,
        source: 'Google',
        referralCreditCents: 5000,
        notes: 'Loved the crew and clean finish'
      },
      {
        customerName: 'Patel Estate',
        rating: 5,
        source: 'Referral',
        referralCreditCents: 10000,
        notes: 'Referred Chen Residence'
      },
      {
        customerName: 'Summit Retail Plaza',
        rating: 3,
        source: 'Email survey',
        referralCreditCents: 0,
        notes: 'Wanted earlier takedown'
      }
    ],
    signTrackers: [
      {
        propertyName: 'Anderson Main Home',
        placedDate: '2026-11-10',
        removedDate: '',
        status: 'placed',
        notes: 'Front lawn near mailbox'
      },
      {
        propertyName: 'Maple Grove Clubhouse',
        placedDate: '2026-11-03',
        removedDate: '',
        status: 'placed',
        notes: 'Entrance island'
      },
      {
        propertyName: 'Chen Residence',
        placedDate: '2025-11-12',
        removedDate: '2026-01-08',
        status: 'removed',
        notes: 'Collected at takedown'
      }
    ],
    automations: [
      {
        name: 'Post-install review request',
        trigger: 'job.status == complete',
        action: 'send_review_email',
        enabled: 'true',
        notes: 'Delay 2 days'
      },
      {
        name: 'Rebooking outreach August',
        trigger: 'calendar.month == 8',
        action: 'create_rebooking_request',
        enabled: 'true',
        notes: 'Prior year customers only'
      },
      {
        name: 'Low inventory alert',
        trigger: 'inventory.quantity < reorderLevel',
        action: 'notify_ops_slack',
        enabled: 'false',
        notes: 'Paused until Slack channel ready'
      }
    ]
  }
}
