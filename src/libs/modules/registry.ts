import type { MemberRole } from '@libs/firebase/types'

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'date' | 'email' | 'url'

export type FieldDef = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: Array<{ value: string; label: string }>
  list?: boolean
}

export type ModuleDef = {
  key: string
  collection: string
  title: string
  singular: string
  description: string
  href: string
  fields: FieldDef[]
}

export const MODULES: ModuleDef[] = [
  {
    key: 'customers',
    collection: 'customers',
    title: 'Customers',
    singular: 'Customer',
    description: 'Residential and commercial customer accounts',
    href: '/customers',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, list: true },
      { key: 'type', label: 'Type', type: 'select', options: [{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }], list: true },
      { key: 'email', label: 'Email', type: 'email', list: true },
      { key: 'phone', label: 'Phone', type: 'text', list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'lead', label: 'Lead' }, { value: 'inactive', label: 'Inactive' }], list: true },
      { key: 'tags', label: 'Tags', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'properties',
    collection: 'properties',
    title: 'Properties',
    singular: 'Property',
    description: 'Service locations linked to customers',
    href: '/properties',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'address', label: 'Address', type: 'text', required: true, list: true },
      { key: 'city', label: 'City', type: 'text', list: true },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'zip', label: 'ZIP', type: 'text' },
      { key: 'serviceNotes', label: 'Service notes', type: 'textarea' }
    ]
  },
  {
    key: 'contacts',
    collection: 'contacts',
    title: 'Contacts',
    singular: 'Contact',
    description: 'People linked to customer accounts',
    href: '/contacts',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'email', label: 'Email', type: 'email', list: true },
      { key: 'phone', label: 'Phone', type: 'text', list: true },
      { key: 'role', label: 'Role', type: 'text', list: true }
    ]
  },
  {
    key: 'mockups',
    collection: 'mockups',
    title: 'Mockups',
    singular: 'Mockup',
    description: 'Design mockups for properties',
    href: '/mockups',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'shared', label: 'Shared' }, { value: 'approved', label: 'Approved' }], list: true },
      { key: 'assetUrl', label: 'Asset URL', type: 'url' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'proposals',
    collection: 'proposals',
    title: 'Proposals',
    singular: 'Proposal',
    description: 'Sales proposals and estimates',
    href: '/proposals',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'publicNumber', label: 'Proposal #', type: 'text', list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'amountCents', label: 'Amount (cents)', type: 'number', list: true },
      { key: 'depositCents', label: 'Deposit (cents)', type: 'number' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'viewed', label: 'Viewed' },
          { value: 'change_requested', label: 'Change requested' },
          { value: 'accepted_pending_signature', label: 'Accepted pending signature' },
          { value: 'accepted_pending_deposit', label: 'Accepted pending deposit' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'approved', label: 'Approved' },
          { value: 'declined', label: 'Declined' },
          { value: 'expired', label: 'Expired' }
        ],
        list: true
      },
      { key: 'customerSummary', label: 'Customer summary', type: 'textarea' },
      { key: 'customerTerms', label: 'Customer terms', type: 'textarea' },
      { key: 'notes', label: 'Staff notes', type: 'textarea' }
    ]
  },
  {
    key: 'commercialAccounts',
    collection: 'commercialAccounts',
    title: 'Commercial Accounts',
    singular: 'Commercial Account',
    description: 'B2B contracts and account notes',
    href: '/commercial-accounts',
    fields: [
      { key: 'name', label: 'Account name', type: 'text', required: true, list: true },
      { key: 'contactName', label: 'Contact', type: 'text', list: true },
      { key: 'contractValueCents', label: 'Contract value (cents)', type: 'number', list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'prospect', label: 'Prospect' }, { value: 'churned', label: 'Churned' }], list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'rebookingRequests',
    collection: 'rebookingRequests',
    title: 'Rebooking',
    singular: 'Rebooking',
    description: 'Rebooking pipeline from prior jobs',
    href: '/rebooking',
    fields: [
      { key: 'customerName', label: 'Customer', type: 'text', required: true, list: true },
      { key: 'priorJobTitle', label: 'Prior job', type: 'text', list: true },
      { key: 'requestedDate', label: 'Requested date', type: 'date', list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'booked', label: 'Booked' }, { value: 'declined', label: 'Declined' }], list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'jobs',
    collection: 'jobs',
    title: 'Jobs',
    singular: 'Job',
    description: 'Installs and service jobs',
    href: '/jobs',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'type', label: 'Type', type: 'select', options: [{ value: 'install', label: 'Install' }, { value: 'service', label: 'Service' }, { value: 'takedown', label: 'Takedown' }], list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'lead', label: 'Lead' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'in_progress', label: 'In progress' }, { value: 'complete', label: 'Complete' }, { value: 'cancelled', label: 'Cancelled' }], list: true },
      { key: 'scheduledDate', label: 'Scheduled date', type: 'date', list: true },
      { key: 'crewNotes', label: 'Crew notes', type: 'textarea' }
    ]
  },
  {
    key: 'projectPrep',
    collection: 'projectPrep',
    title: 'Project Prep',
    singular: 'Prep item',
    description: 'Prep checklists for jobs',
    href: '/project-prep',
    fields: [
      { key: 'jobTitle', label: 'Job', type: 'text', required: true, list: true },
      { key: 'item', label: 'Checklist item', type: 'text', required: true, list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'todo', label: 'To do' }, { value: 'done', label: 'Done' }, { value: 'blocked', label: 'Blocked' }], list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'scheduleEvents',
    collection: 'scheduleEvents',
    title: 'Schedule',
    singular: 'Schedule event',
    description: 'Scheduled work for crews',
    href: '/schedule',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'jobTitle', label: 'Job', type: 'text', list: true },
      { key: 'date', label: 'Date', type: 'date', required: true, list: true },
      { key: 'startTime', label: 'Start', type: 'text', list: true },
      { key: 'crew', label: 'Crew', type: 'text', list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'routes',
    collection: 'routes',
    title: 'Routes',
    singular: 'Route',
    description: 'Daily stop lists',
    href: '/routes',
    fields: [
      { key: 'name', label: 'Route name', type: 'text', required: true, list: true },
      { key: 'date', label: 'Date', type: 'date', required: true, list: true },
      { key: 'stops', label: 'Stops (comma separated)', type: 'textarea', list: true },
      { key: 'driver', label: 'Driver', type: 'text', list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'planned', label: 'Planned' }, { value: 'in_progress', label: 'In progress' }, { value: 'done', label: 'Done' }], list: true }
    ]
  },
  {
    key: 'serviceIssues',
    collection: 'serviceIssues',
    title: 'Service Issues',
    singular: 'Service issue',
    description: 'Tickets on jobs and properties',
    href: '/service-issues',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'publicNumber', label: 'Request #', type: 'text', list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'jobTitle', label: 'Job', type: 'text', list: true },
      { key: 'problemType', label: 'Problem type', type: 'text', list: true },
      { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }], list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In progress' }, { value: 'resolved', label: 'Resolved' }], list: true },
      { key: 'customerVisibleResolution', label: 'Customer resolution', type: 'textarea' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'lightingItems',
    collection: 'lightingItems',
    title: 'Lighting Package',
    singular: 'Lighting item',
    description: 'Customer-facing lighting package items by service area',
    href: '/lighting-items',
    fields: [
      { key: 'name', label: 'Item name', type: 'text', required: true, list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'serviceArea', label: 'Service area', type: 'text', required: true, list: true },
      { key: 'lightType', label: 'Light type', type: 'text', list: true },
      { key: 'color', label: 'Color', type: 'text', list: true },
      { key: 'linearFeet', label: 'Linear feet', type: 'number', list: true },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'installationLocation', label: 'Location', type: 'text' },
      { key: 'customerNotes', label: 'Customer notes', type: 'textarea' },
      { key: 'customerVisible', label: 'Customer visible', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }], list: true },
      { key: 'status', label: 'Status', type: 'text', list: true },
      { key: 'notes', label: 'Staff notes', type: 'textarea' }
    ]
  },
  {
    key: 'photos',
    collection: 'photos',
    title: 'Photos',
    singular: 'Photo',
    description: 'Design, install, and service photos',
    href: '/photos',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'category', label: 'Category', type: 'select', options: [
        { value: 'Design preview', label: 'Design preview' },
        { value: 'Before installation', label: 'Before installation' },
        { value: 'Completed installation', label: 'Completed installation' },
        { value: 'Service issue', label: 'Service issue' },
        { value: 'Service completion', label: 'Service completion' },
        { value: 'Removal completion', label: 'Removal completion' },
        { value: 'Customer-uploaded reference', label: 'Customer-uploaded reference' },
        { value: 'Property reference', label: 'Property reference' }
      ], list: true },
      { key: 'url', label: 'Image URL', type: 'url', required: true },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'customerVisible', label: 'Customer visible', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }], list: true },
      { key: 'notes', label: 'Staff notes', type: 'textarea' }
    ]
  },
  {
    key: 'documents',
    collection: 'documents',
    title: 'Documents',
    singular: 'Document',
    description: 'Customer agreements and portal documents',
    href: '/documents',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, list: true },
      { key: 'publicNumber', label: 'Document #', type: 'text', list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'Proposal', label: 'Proposal' },
          { value: 'Service agreement', label: 'Service agreement' },
          { value: 'Signed contract', label: 'Signed contract' },
          { value: 'Invoice', label: 'Invoice' },
          { value: 'Payment receipt', label: 'Payment receipt' },
          { value: 'Installation agreement', label: 'Installation agreement' },
          { value: 'Property authorization', label: 'Property authorization' },
          { value: 'Warranty information', label: 'Warranty information' },
          { value: 'Care and safety instructions', label: 'Care and safety instructions' },
          { value: 'Other customer document', label: 'Other customer document' }
        ],
        list: true
      },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'available', label: 'Available' }, { value: 'pending_signature', label: 'Pending signature' }, { value: 'signed', label: 'Signed' }], list: true },
      { key: 'signatureStatus', label: 'Signature', type: 'select', options: [{ value: 'not_required', label: 'Not required' }, { value: 'pending', label: 'Pending' }, { value: 'signed', label: 'Signed' }], list: true },
      { key: 'url', label: 'Download URL', type: 'url' },
      { key: 'customerVisible', label: 'Customer visible', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }], list: true },
      { key: 'notes', label: 'Staff notes', type: 'textarea' }
    ]
  },
  {
    key: 'timeEntries',
    collection: 'timeEntries',
    title: 'Time Clock',
    singular: 'Time entry',
    description: 'Clock in/out records',
    href: '/time-clock',
    fields: [
      { key: 'userName', label: 'Team member', type: 'text', required: true, list: true },
      { key: 'jobTitle', label: 'Job', type: 'text', list: true },
      { key: 'clockIn', label: 'Clock in', type: 'text', list: true },
      { key: 'clockOut', label: 'Clock out', type: 'text', list: true },
      { key: 'hours', label: 'Hours', type: 'number', list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'customerStorage',
    collection: 'customerStorage',
    title: 'Customer Storage',
    singular: 'Storage item',
    description: 'Customer materials held in storage',
    href: '/customer-storage',
    fields: [
      { key: 'itemName', label: 'Item', type: 'text', required: true, list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'propertyName', label: 'Property', type: 'text', list: true },
      { key: 'quantity', label: 'Qty', type: 'number', list: true },
      { key: 'location', label: 'Location', type: 'text', list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'inventoryItems',
    collection: 'inventoryItems',
    title: 'Inventory',
    singular: 'Inventory item',
    description: 'Stock and reorder levels',
    href: '/inventory',
    fields: [
      { key: 'sku', label: 'SKU', type: 'text', required: true, list: true },
      { key: 'name', label: 'Name', type: 'text', required: true, list: true },
      { key: 'quantity', label: 'Qty', type: 'number', list: true },
      { key: 'reorderLevel', label: 'Reorder level', type: 'number', list: true },
      { key: 'location', label: 'Location', type: 'text', list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'invoices',
    collection: 'invoices',
    title: 'Invoices',
    singular: 'Invoice',
    description: 'Customer invoices',
    href: '/invoices',
    fields: [
      { key: 'number', label: 'Invoice #', type: 'text', required: true, list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'jobTitle', label: 'Job', type: 'text', list: true },
      { key: 'amountCents', label: 'Amount (cents)', type: 'number', list: true },
      { key: 'amountPaidCents', label: 'Paid (cents)', type: 'number', list: true },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'open', label: 'Open' },
          { value: 'partially_paid', label: 'Partially paid' },
          { value: 'paid', label: 'Paid' },
          { value: 'past_due', label: 'Past due' },
          { value: 'void', label: 'Void' },
          { value: 'refunded', label: 'Refunded' }
        ],
        list: true
      },
      { key: 'dueDate', label: 'Due date', type: 'date', list: true },
      { key: 'creditsCents', label: 'Credits (cents)', type: 'number' },
      { key: 'notes', label: 'Staff notes', type: 'textarea' }
    ]
  },
  {
    key: 'payments',
    collection: 'payments',
    title: 'Payments',
    singular: 'Payment',
    description: 'Customer payment records from portal and office',
    href: '/payments',
    fields: [
      { key: 'publicNumber', label: 'Payment #', type: 'text', list: true },
      { key: 'invoiceNumber', label: 'Invoice #', type: 'text', list: true },
      { key: 'customerName', label: 'Customer', type: 'text', list: true },
      { key: 'amountCents', label: 'Amount (cents)', type: 'number', list: true },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' }
        ],
        list: true
      },
      { key: 'methodLabel', label: 'Method', type: 'text', list: true },
      { key: 'receiptUrl', label: 'Receipt URL', type: 'url' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'messages',
    collection: 'messages',
    title: 'Messages',
    singular: 'Message',
    description: 'Outbound message log',
    href: '/messages',
    fields: [
      { key: 'to', label: 'To', type: 'text', required: true, list: true },
      { key: 'channel', label: 'Channel', type: 'select', options: [{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'other', label: 'Other' }], list: true },
      { key: 'subject', label: 'Subject', type: 'text', list: true },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'failed', label: 'Failed' }], list: true }
    ]
  },
  {
    key: 'reviews',
    collection: 'reviews',
    title: 'Reviews & Referrals',
    singular: 'Review',
    description: 'Reviews and referral credits',
    href: '/reviews',
    fields: [
      { key: 'customerName', label: 'Customer', type: 'text', required: true, list: true },
      { key: 'rating', label: 'Rating', type: 'number', list: true },
      { key: 'source', label: 'Source', type: 'text', list: true },
      { key: 'referralCreditCents', label: 'Referral credit (cents)', type: 'number', list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'signTrackers',
    collection: 'signTrackers',
    title: 'Sign Tracker',
    singular: 'Sign',
    description: 'Yard sign placements',
    href: '/sign-tracker',
    fields: [
      { key: 'propertyName', label: 'Property', type: 'text', required: true, list: true },
      { key: 'placedDate', label: 'Placed', type: 'date', list: true },
      { key: 'removedDate', label: 'Removed', type: 'date', list: true },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'placed', label: 'Placed' }, { value: 'removed', label: 'Removed' }], list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    key: 'automations',
    collection: 'automations',
    title: 'Automation',
    singular: 'Automation',
    description: 'Trigger/action rules (stubs)',
    href: '/automation',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, list: true },
      { key: 'trigger', label: 'Trigger', type: 'text', list: true },
      { key: 'action', label: 'Action', type: 'text', list: true },
      { key: 'enabled', label: 'Enabled', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }], list: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  }
]

export function getModule(keyOrCollection: string) {
  return MODULES.find(m => m.key === keyOrCollection || m.collection === keyOrCollection)
}

export function isValidCollection(collection: string) {
  return MODULES.some(m => m.collection === collection)
}

export type { MemberRole }
