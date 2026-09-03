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
        serviceNotes: 'Ladder access on south side; pets indoors',
        customerAccessInstructions: 'Use the side gate; dogs will be indoors.',
        petNotice: 'Two friendly labs — please keep gate closed',
        preferredArrival: 'Morning window preferred',
        timerLocation: 'Garage outlet on left wall',
        powerSourceSummary: 'Exterior GFCI near garage'
      },
      {
        name: 'Anderson Guest Cottage',
        customerName: 'Anderson Residence',
        address: '414 Cedar Lane',
        city: 'Greenville',
        state: 'SC',
        zip: '29601',
        serviceNotes: 'Smaller package for guest cottage eaves',
        preferredArrival: 'Afternoon preferred'
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
        publicNumber: 'PROP-2026-00412',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        amountCents: 185000,
        depositCents: 55500,
        taxCents: 0,
        version: 1,
        status: 'accepted',
        customerSummary: 'Warm white roofline, tree wraps, and wreath package for the 2026 season.',
        customerTerms: 'Includes install, mid-season service, and takedown. Deposit due on acceptance.',
        lineItems: [
          {
            id: 'roof',
            name: 'Warm White C9 Roofline',
            serviceArea: 'Roofline',
            description: '185 linear feet',
            amountCents: 120000,
            optional: false,
            selected: true
          },
          {
            id: 'trees',
            name: 'Oak tree wraps',
            serviceArea: 'Trees',
            description: 'Two front oaks',
            amountCents: 45000,
            optional: false,
            selected: true
          },
          {
            id: 'wreath',
            name: '48-inch pre-lit wreath',
            serviceArea: 'Wreaths',
            amountCents: 20000,
            optional: false,
            selected: true
          }
        ],
        notes: 'Includes install, mid-season service, takedown'
      },
      {
        title: 'Maple Grove Common Areas',
        publicNumber: 'PROP-2026-00418',
        customerName: 'Maple Grove HOA',
        propertyName: 'Maple Grove Clubhouse',
        amountCents: 920000,
        depositCents: 276000,
        taxCents: 0,
        version: 1,
        status: 'sent',
        customerSummary: 'Clubhouse façade and entry lighting for the HOA common areas.',
        customerTerms: '3-year term option available. Board approval required before install.',
        lineItems: [
          {
            id: 'facade',
            name: 'Clubhouse canopy outline',
            serviceArea: 'Commercial façade',
            amountCents: 680000,
            optional: false,
            selected: true
          },
          {
            id: 'entries',
            name: 'Entry columns',
            serviceArea: 'Columns',
            amountCents: 180000,
            optional: false,
            selected: true
          },
          {
            id: 'trees-opt',
            name: 'Additional courtyard trees',
            serviceArea: 'Trees',
            amountCents: 60000,
            optional: true,
            selected: false
          }
        ],
        notes: '3-year term option included'
      },
      {
        title: 'Riverfront Patio Glow',
        publicNumber: 'PROP-2026-00421',
        customerName: 'Riverfront Bistro',
        propertyName: 'Riverfront Patio',
        amountCents: 275000,
        status: 'draft',
        notes: 'Commercial outlet survey pending'
      }
    ],
    documents: [
      {
        title: 'Anderson seasonal service agreement',
        publicNumber: 'DOC-2026-1001',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        category: 'Service agreement',
        status: 'signed',
        signatureStatus: 'signed',
        version: 1,
        customerVisible: 'true',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        signedAt: '2026-10-01T15:00:00.000Z',
        signerName: 'Sarah Anderson'
      },
      {
        title: 'Maple Grove property authorization',
        publicNumber: 'DOC-2026-1002',
        customerName: 'Maple Grove HOA',
        propertyName: 'Maple Grove Clubhouse',
        category: 'Property authorization',
        status: 'pending_signature',
        signatureStatus: 'pending',
        version: 1,
        customerVisible: 'true',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        title: 'Internal cost worksheet',
        publicNumber: 'DOC-2026-INTERNAL',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        category: 'Other customer document',
        status: 'available',
        signatureStatus: 'not_required',
        customerVisible: 'false',
        notes: 'Staff only — never portal'
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
        status: 'en_route',
        scheduledDate: '2026-11-10',
        arrivalWindow: '8:00–10:00 AM',
        crewFirstName: 'Marcus',
        technicianEnRoute: true,
        weatherNotice: 'Light rain possible — crew will tarp tools and continue unless winds exceed safe limits.',
        customerPrepNotes: 'Please clear driveway parking and keep pets indoors.',
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
        publicNumber: 'SR-2026-00001',
        propertyName: 'Anderson Main Home',
        jobTitle: 'Anderson Mid-season Service',
        problemType: 'Section of lights out',
        problemLocation: 'Roofline',
        customerDescription: 'Front gable section went dark after the wind storm.',
        priority: 'medium',
        status: 'open',
        notes: 'Homeowner reported after wind storm',
        customerName: 'Anderson Residence',
        source: 'staff'
      },
      {
        title: 'Controller reset needed',
        publicNumber: 'SR-2026-00002',
        propertyName: 'Maple Grove Clubhouse',
        jobTitle: 'Maple Grove Clubhouse Install',
        problemType: 'Timer problem',
        problemLocation: 'Other',
        priority: 'low',
        status: 'in_progress',
        notes: 'Timer drifted after power blip',
        customerName: 'Maple Grove HOA',
        source: 'staff'
      },
      {
        title: 'Broken clip on patio rail',
        publicNumber: 'SR-2026-00003',
        propertyName: 'Riverfront Patio',
        jobTitle: '',
        problemType: 'Decorations damaged',
        problemLocation: 'Other',
        priority: 'high',
        status: 'resolved',
        customerVisibleResolution: 'Clip replaced during walkthrough.',
        notes: 'Replaced during walkthrough',
        customerName: 'Riverfront Bistro',
        source: 'staff'
      }
    ],
    lightingItems: [
      {
        name: 'Warm White C9 Lights',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        serviceArea: 'Roofline',
        lightType: 'C9',
        color: 'Warm white',
        linearFeet: 185,
        installationLocation: 'Front and right elevation',
        customerNotes: 'Included in seasonal package',
        customerVisible: 'true',
        status: 'Installed'
      },
      {
        name: 'Oak tree wraps',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        serviceArea: 'Trees',
        lightType: 'Mini lights',
        color: 'Warm white',
        quantity: 2,
        installationLocation: 'Two front oak trees',
        customerVisible: 'true',
        status: 'Installed'
      },
      {
        name: '48-inch pre-lit wreath',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        serviceArea: 'Wreaths',
        lightType: 'Pre-lit wreath',
        color: 'Warm white',
        quantity: 1,
        installationLocation: 'Front peak',
        customerVisible: 'true',
        status: 'Installed'
      },
      {
        name: 'Clubhouse canopy outline',
        customerName: 'Maple Grove HOA',
        propertyName: 'Maple Grove Clubhouse',
        serviceArea: 'Commercial façade',
        lightType: 'C9',
        color: 'Cool white',
        linearFeet: 240,
        customerVisible: 'true',
        status: 'Scheduled'
      }
    ],
    photos: [
      {
        title: 'Anderson completed roofline',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        category: 'Completed installation',
        url: 'https://images.unsplash.com/photo-1482517964108-0c2d5e0b5e3d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Front elevation after install',
        customerVisible: 'true'
      },
      {
        title: 'Anderson design preview',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        category: 'Design preview',
        url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=80',
        caption: 'Approved warm white concept',
        customerVisible: 'true'
      },
      {
        title: 'Internal crew reference',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        category: 'Property reference',
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
        caption: 'Staff only ladder access note',
        customerVisible: 'false',
        notes: 'Do not show in portal'
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
        amountPaidCents: 185000,
        status: 'paid',
        dueDate: '2026-11-01',
        creditsCents: 0,
        lineItems: [
          { name: '2026 holiday package', amountCents: 185000 }
        ],
        notes: 'Deposit + balance paid'
      },
      {
        number: 'INV-2026-1108',
        customerName: 'Maple Grove HOA',
        jobTitle: 'Maple Grove Clubhouse Install',
        amountCents: 460000,
        amountPaidCents: 0,
        status: 'sent',
        dueDate: '2026-11-15',
        creditsCents: 0,
        lineItems: [
          { name: '50% deposit — clubhouse install', amountCents: 460000 }
        ],
        notes: '50% deposit invoice'
      },
      {
        number: 'INV-2026-1120',
        customerName: 'Riverfront Bistro',
        jobTitle: '',
        amountCents: 50000,
        amountPaidCents: 0,
        status: 'draft',
        dueDate: '2026-11-20',
        notes: 'Design retainer'
      }
    ],
    payments: [
      {
        publicNumber: 'PAY-INV-2026-1042-SEED01',
        invoiceNumber: 'INV-2026-1042',
        customerName: 'Anderson Residence',
        amountCents: 185000,
        status: 'completed',
        methodLabel: 'Card',
        receiptUrl: 'https://pay.stripe.com/receipts/test_seed',
        notes: 'Seeded completed payment'
      }
    ],
    messages: [
      {
        to: 'sarah.anderson@example.com',
        channel: 'email',
        subject: 'Install confirmed for Nov 10',
        body: 'Your holiday lighting install is scheduled for November 10 starting at 8am.',
        status: 'sent',
        customerName: 'Anderson Residence',
        customerId: '',
        threadPublicNumber: 'MSG-2026-SEED1'
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
    messageThreads: [
      {
        publicNumber: 'MSG-2026-SEED1',
        subject: 'Install day questions',
        preview: 'Will someone need to be home for the install?',
        customerName: 'Anderson Residence',
        propertyName: 'Anderson Main Home',
        customerVisible: true,
        customerUnread: true,
        staffUnread: false,
        source: 'seed'
      }
    ],
    referralInvites: [
      {
        customerName: 'Anderson Residence',
        friendName: 'Jamie Ortiz',
        friendEmail: 'jamie.ortiz@example.com',
        status: 'pending',
        source: 'seed'
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
