import 'server-only'

import type { DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import { getTenantBranding } from '@libs/branding/storage'
import { loadCustomerScopedDocs } from '@libs/customer-portal/customer-scope'
import type { CustomerPortalRecord, PortalHomeDto } from '@libs/customer-portal/types'
import { derivePortalStatus, portalPrimaryAction } from '@libs/customer-portal/status-logic'

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

async function loadRelated(tenantId: string, customerName: string, customerId: string, propertyId: string | null) {
  const tenantRef = adminDb.collection('tenants').doc(tenantId)

  const [proposals, invoices, rebooking, propertiesById, propertiesByName, jobsSnap, issuesSnap] = await Promise.all([
    loadCustomerScopedDocs(tenantRef.collection('proposals'), { customerId, customerName, limit: 20 }),
    loadCustomerScopedDocs(tenantRef.collection('invoices'), { customerId, customerName, limit: 20 }),
    loadCustomerScopedDocs(tenantRef.collection('rebookingRequests'), { customerId, customerName, limit: 10 }),
    tenantRef.collection('properties').where('customerId', '==', customerId).limit(20).get().catch(() => null),
    customerName
      ? tenantRef.collection('properties').where('customerName', '==', customerName).limit(20).get().catch(() => null)
      : Promise.resolve(null),
    tenantRef.collection('jobs').limit(100).get(),
    tenantRef.collection('serviceIssues').limit(100).get()
  ])

  const propertiesMap = new Map<string, DocumentData & { id: string }>()

  for (const doc of propertiesById?.docs || []) {
    propertiesMap.set(doc.id, { id: doc.id, ...doc.data() })
  }

  for (const doc of propertiesByName?.docs || []) {
    if (propertiesMap.has(doc.id)) continue
    const data = doc.data()

    if (data.customerId && String(data.customerId) !== customerId) continue
    propertiesMap.set(doc.id, { id: doc.id, ...data })
  }

  const properties = [...propertiesMap.values()]
  const selected =
    (propertyId ? properties.find(p => p.id === propertyId) : null) || properties[0] || null
  const propertyNames = new Set(properties.map(p => String(p.name || '')))

  const jobs = jobsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }) as DocumentData & { id: string })
    .filter(j => {
      if (j.customerId) return String(j.customerId) === customerId

      return propertyNames.has(String(j.propertyName || '')) || String(j.customerName || '') === customerName
    })

  const issues = issuesSnap.docs
    .map(d => ({ id: d.id, ...d.data() }) as DocumentData & { id: string })
    .filter(i => {
      if (i.customerId) return String(i.customerId) === customerId

      return propertyNames.has(String(i.propertyName || '')) || String(i.customerName || '') === customerName
    })

  return {
    proposals,
    jobs,
    issues,
    invoices,
    rebooking,
    property: selected,
    properties
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
  const derived = derivePortalStatus({
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

  const accountType = String(customer.type || 'residential').toLowerCase()
  const isCommercial = accountType === 'commercial' || accountType.includes('hoa')
  const selectedPropertyId =
    portal.primaryPropertyId || (related.property ? String((related.property as DocumentData & { id?: string }).id || '') : '')
  const properties = related.properties.map(property => ({
    id: String(property.id),
    name: String(property.name || 'Property'),
    address: [property.address, property.city, property.state].filter(Boolean).join(', '),
    selected: selectedPropertyId ? property.id === selectedPropertyId : false
  }))

  if (properties.length > 0 && !properties.some(p => p.selected)) {
    properties[0]!.selected = true
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
    customerGreeting: isCommercial
      ? `Welcome, ${customerName || 'team'}`
      : `Welcome back, ${greetingName(customer)}`,
    propertySummary: propertyLabel(related.property),
    status: {
      label: derived.label,
      detail: derived.detail,
      date: derived.date
    },
    primaryAction: portalPrimaryAction(derived.stage, settings.renewalLabel || 'Renew Service', settings.removalLabel || 'Removal'),
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
    supportEmail: settings.supportEmail || (typeof general.supportEmail === 'string' ? general.supportEmail : null),
    accountType,
    properties,
    canSwitchProperties: Boolean(settings.multipleProperties && properties.length > 1)
  }
}
