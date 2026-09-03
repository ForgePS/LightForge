import 'server-only'

import type { DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getTenantBranding } from '@libs/branding/storage'
import type { CustomerPortalRecord, PortalHomeDto, PortalPrimaryAction } from '@libs/customer-portal/types'

function asIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybe = value as { toDate?: () => Date }

    if (typeof maybe.toDate === 'function') return maybe.toDate().toISOString()
  }

  return null
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name
}

function greetingName(customer: DocumentData) {
  const name = String(customer.name || 'there')

  return firstName(name)
}

function propertyLabel(property: DocumentData | null) {
  if (!property) return null

  const address = [property.address, property.city, property.state].filter(Boolean).join(', ')

  return address || String(property.name || null)
}

function seasonLabel(now = new Date()) {
  return `${now.getFullYear()} Christmas Lighting Season`
}

type DerivedStatus = {
  label: string
  detail: string | null
  date: string | null
  stage:
    | 'proposal'
    | 'deposit'
    | 'install_scheduled'
    | 'install_progress'
    | 'install_complete'
    | 'active'
    | 'service_open'
    | 'removal'
    | 'storage'
    | 'renewal'
}

function deriveStatus(input: {
  proposals: DocumentData[]
  jobs: DocumentData[]
  issues: DocumentData[]
  invoices: DocumentData[]
  rebooking: DocumentData[]
  removalLabel: string
}): DerivedStatus {
  const openIssue = input.issues.find(i => i.status !== 'resolved')

  if (openIssue) {
    return {
      label: 'SERVICE REQUEST OPEN',
      detail: String(openIssue.title || 'We are working on your request'),
      date: asIso(openIssue.updatedAt) || asIso(openIssue.createdAt),
      stage: 'service_open'
    }
  }

  const installInProgress = input.jobs.find(j => j.type === 'install' && j.status === 'in_progress')

  if (installInProgress) {
    return {
      label: 'INSTALLATION IN PROGRESS',
      detail: 'Your installation is underway',
      date: String(installInProgress.scheduledDate || '') || null,
      stage: 'install_progress'
    }
  }

  const installScheduled = input.jobs.find(j => j.type === 'install' && j.status === 'scheduled')

  if (installScheduled) {
    return {
      label: 'INSTALLATION SCHEDULED',
      detail: 'Arrival details will appear here when available',
      date: String(installScheduled.scheduledDate || '') || null,
      stage: 'install_scheduled'
    }
  }

  const removalScheduled = input.jobs.find(
    j => (j.type === 'takedown' || j.type === 'removal') && ['scheduled', 'in_progress'].includes(String(j.status))
  )

  if (removalScheduled) {
    return {
      label: `${input.removalLabel.toUpperCase()} SCHEDULED`,
      detail: `Your ${input.removalLabel.toLowerCase()} is scheduled`,
      date: String(removalScheduled.scheduledDate || '') || null,
      stage: 'removal'
    }
  }

  const sentProposal = input.proposals.find(p => p.status === 'sent')

  if (sentProposal) {
    return {
      label: 'PROPOSAL READY',
      detail: String(sentProposal.title || 'Your lighting proposal is ready'),
      date: asIso(sentProposal.updatedAt),
      stage: 'proposal'
    }
  }

  const unpaid = input.invoices.find(i => ['sent', 'open', 'partially_paid'].includes(String(i.status)))

  if (unpaid) {
    return {
      label: 'BALANCE DUE',
      detail: unpaid.number ? `Invoice ${unpaid.number}` : 'A payment is due',
      date: String(unpaid.dueDate || '') || null,
      stage: 'deposit'
    }
  }

  const installComplete = input.jobs.find(j => j.type === 'install' && j.status === 'complete')

  if (installComplete) {
    const renewal = input.rebooking.find(r => ['new', 'contacted'].includes(String(r.status)))

    if (renewal) {
      return {
        label: 'RENEWAL AVAILABLE',
        detail: 'Reserve your next season',
        date: String(renewal.requestedDate || '') || null,
        stage: 'renewal'
      }
    }

    return {
      label: 'LIGHTS INSTALLED',
      detail: 'Your Christmas lights are installed',
      date: String(installComplete.scheduledDate || '') || asIso(installComplete.updatedAt),
      stage: 'install_complete'
    }
  }

  const storageHint = input.jobs.some(j => j.type === 'takedown' && j.status === 'complete')

  if (storageHint) {
    return {
      label: 'IN STORAGE',
      detail: 'Your lights are safely stored',
      date: null,
      stage: 'storage'
    }
  }

  return {
    label: 'ACTIVE SEASON',
    detail: 'Need help with your lights?',
    date: null,
    stage: 'active'
  }
}

function primaryActionFor(
  stage: DerivedStatus['stage'],
  renewalLabel: string,
  removalLabel: string
): PortalPrimaryAction {
  switch (stage) {
    case 'proposal':
      return { key: 'proposal', message: 'Your lighting proposal is ready', actionLabel: 'View Proposal', href: '/portal/proposals' }
    case 'deposit':
      return { key: 'pay', message: 'Your balance is due', actionLabel: 'Pay Now', href: '/portal/invoices' }
    case 'install_scheduled':
      return { key: 'schedule', message: 'Your installation is scheduled', actionLabel: 'View Schedule', href: '/portal/schedule' }
    case 'install_progress':
      return { key: 'status', message: 'Your installation is underway', actionLabel: 'View Status', href: '/portal/schedule' }
    case 'install_complete':
      return { key: 'photos', message: 'Your Christmas lights are installed', actionLabel: 'View Photos', href: '/portal/photos' }
    case 'service_open':
      return { key: 'track', message: 'We are working on your request', actionLabel: 'Track Request', href: '/portal/service' }
    case 'removal':
      return {
        key: 'removal',
        message: `Your ${removalLabel.toLowerCase()} is scheduled`,
        actionLabel: `View ${removalLabel} Date`,
        href: '/portal/schedule'
      }
    case 'storage':
      return { key: 'summary', message: 'Your lights are safely stored', actionLabel: 'View Season Summary', href: '/portal/home' }
    case 'renewal':
      return { key: 'renew', message: 'Reserve your next season', actionLabel: renewalLabel, href: '/portal/renewal' }
    default:
      return { key: 'service', message: 'Need help with your lights?', actionLabel: 'Request Service', href: '/portal/service/new' }
  }
}

async function loadRelated(tenantId: string, customerName: string, customerId: string, propertyId: string | null) {
  const tenantRef = adminDb.collection('tenants').doc(tenantId)

  const [proposalsSnap, jobsSnap, issuesSnap, invoicesSnap, rebookingSnap, propertySnap] = await Promise.all([
    tenantRef.collection('proposals').where('customerName', '==', customerName).limit(20).get().catch(() => null),
    tenantRef.collection('jobs').limit(100).get(),
    tenantRef.collection('serviceIssues').limit(100).get(),
    tenantRef.collection('invoices').where('customerName', '==', customerName).limit(20).get().catch(() => null),
    tenantRef.collection('rebookingRequests').where('customerName', '==', customerName).limit(10).get().catch(() => null),
    propertyId ? tenantRef.collection('properties').doc(propertyId).get() : Promise.resolve(null)
  ])

  const propertiesByCustomer = propertySnap?.exists
    ? [propertySnap.data()!]
    : (
        await tenantRef.collection('properties').where('customerName', '==', customerName).limit(5).get()
      ).docs.map(d => d.data())

  const propertyNames = new Set(propertiesByCustomer.map(p => String(p.name || '')))

  const jobs = jobsSnap.docs
    .map(d => d.data())
    .filter(j => propertyNames.has(String(j.propertyName || '')) || j.customerId === customerId)

  const issues = issuesSnap.docs
    .map(d => d.data())
    .filter(i => propertyNames.has(String(i.propertyName || '')) || i.customerId === customerId)

  return {
    proposals: proposalsSnap ? proposalsSnap.docs.map(d => d.data()) : [],
    jobs,
    issues,
    invoices: invoicesSnap ? invoicesSnap.docs.map(d => d.data()) : [],
    rebooking: rebookingSnap ? rebookingSnap.docs.map(d => d.data()) : [],
    property: propertiesByCustomer[0] || null
  }
}

export async function buildPortalHomeDto(tenantId: string, portal: CustomerPortalRecord): Promise<PortalHomeDto> {
  const [settings, branding, customerSnap, generalSnap] = await Promise.all([
    getTenantPortalSettings(tenantId),
    getTenantBranding(tenantId),
    adminDb.collection('tenants').doc(tenantId).collection('customers').doc(portal.customerId).get(),
    adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general').get()
  ])

  if (!customerSnap.exists) {
    throw Object.assign(new Error('Customer not found'), { status: 404 })
  }

  const customer = customerSnap.data()!
  const customerName = String(customer.name || '')
  const related = await loadRelated(tenantId, customerName, portal.customerId, portal.primaryPropertyId)
  const derived = deriveStatus({
    proposals: related.proposals,
    jobs: related.jobs,
    issues: related.issues,
    invoices: related.invoices,
    rebooking: related.rebooking,
    removalLabel: settings.removalLabel || 'Removal'
  })

  const unpaid = related.invoices.find(i => ['sent', 'open', 'partially_paid'].includes(String(i.status)))
  const general = generalSnap.exists ? generalSnap.data()! : {}
  const contractorName = String(general.companyName || '')
  const tenantNameSnap = await adminDb.collection('tenants').doc(tenantId).get()
  const fallbackName = tenantNameSnap.exists ? String(tenantNameSnap.data()?.name || 'Lighting Company') : 'Lighting Company'

  const activity: PortalHomeDto['recentActivity'] = []

  for (const p of related.proposals.filter(x => x.status !== 'draft').slice(0, 2)) {
    activity.push({
      label: p.status === 'accepted' ? 'Proposal approved' : 'Proposal updated',
      at: asIso(p.updatedAt)
    })
  }

  for (const j of related.jobs.filter(x => x.status === 'complete').slice(0, 2)) {
    activity.push({
      label: j.type === 'install' ? 'Installation completed' : 'Job completed',
      at: asIso(j.updatedAt) || String(j.scheduledDate || '') || null
    })
  }

  for (const i of related.issues.slice(0, 2)) {
    activity.push({
      label: i.status === 'resolved' ? 'Service request updated' : 'Service request received',
      at: asIso(i.updatedAt) || asIso(i.createdAt)
    })
  }

  return {
    contractorName: contractorName || fallbackName,
    portalName:
      portal.portalNameOverride ||
      settings.portalDisplayName ||
      `${contractorName || fallbackName} Customer Portal`,
    logoUrl: branding.logoUrl || null,
    primaryColor: branding.primaryColor || null,
    accentColor: branding.accentColor || null,
    seasonLabel: seasonLabel(),
    customerGreeting: `Welcome back, ${greetingName(customer)}`,
    propertySummary: propertyLabel(related.property),
    status: {
      label: derived.label,
      detail: derived.detail,
      date: derived.date
    },
    primaryAction: primaryActionFor(derived.stage, settings.renewalLabel || 'Renew Service', settings.removalLabel || 'Removal'),
    balance: unpaid
      ? {
          amountCents: Number(unpaid.amountCents || 0),
          dueDate: String(unpaid.dueDate || '') || null,
          invoiceNumber: unpaid.number ? String(unpaid.number) : null,
          pastDue: Boolean(unpaid.dueDate && String(unpaid.dueDate) < new Date().toISOString().slice(0, 10))
        }
      : null,
    recentActivity: activity.slice(0, 5),
    features: {
      myLighting: settings.myLighting,
      photos: settings.photos,
      schedule: settings.schedule,
      serviceRequests: settings.serviceRequests,
      proposals: settings.proposals,
      invoices: true,
      agreements: settings.agreements,
      messages: settings.messages,
      property: settings.propertyInformation,
      renewal: settings.seasonalRenewal
    },
    showPoweredBy: settings.showPoweredBy,
    supportPhone: settings.supportPhone,
    supportEmail: settings.supportEmail || (typeof general.supportEmail === 'string' ? general.supportEmail : null)
  }
}
