import 'server-only'

import { FieldValue, type DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'
import { getPortalLighting } from '@libs/customer-portal/lighting'
import { requireAssuranceLevel } from '@libs/customer-portal/verification'

export async function getPortalRenewal(session: PortalSessionContext) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.seasonalRenewal) {
    throw Object.assign(new Error('Renewal is not available'), { status: 403 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const year = new Date().getFullYear()
  const lighting = await getPortalLighting(session)

  const existing = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('rebookingRequests')
    .where('customerName', '==', ctx.customerName)
    .limit(10)
    .get()

  const open = existing.docs
    .map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) }) as DocumentData & { id: string })
    .find(row => ['new', 'contacted', 'pending'].includes(String(row.status || '')))

  const priorJobs = await adminDb.collection('tenants').doc(ctx.tenantId).collection('jobs').limit(50).get()
  const priorInstall = priorJobs.docs
    .map(doc => doc.data())
    .filter(job => belongsToPortalCustomer(job, ctx))
    .find(job => job.type === 'install' && job.status === 'complete')

  return {
    available: true,
    seasonLabel: `${year + 1} Christmas Lighting Season`,
    renewalLabel: settings.renewalLabel || 'Renew Service',
    priorPackage: lighting.groups,
    priorJobTitle: priorInstall?.title ? String(priorInstall.title) : null,
    proposedAmountCents: null as number | null,
    existingRequest: open
      ? {
          id: open.id,
          status: String(open.status || 'new'),
          requestedDate: open.requestedDate ? String(open.requestedDate) : null,
          notes: open.notes ? String(open.notes) : null,
          keepSameDesign: open.keepSameDesign !== false
        }
      : null
  }
}

export async function submitPortalRenewal(
  session: PortalSessionContext,
  input: {
    keepSameDesign: boolean
    changeRequest?: string
    preferredPeriod?: string
    acceptTerms: boolean
    signerName?: string
  }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.seasonalRenewal) {
    throw Object.assign(new Error('Renewal is not available'), { status: 403 })
  }

  if (!input.acceptTerms) {
    throw Object.assign(new Error('Please accept the renewal terms'), { status: 400 })
  }

  if (input.signerName) {
    await requireAssuranceLevel(3)
  }

  const ctx = await loadPortalCustomerContext(session)
  const lighting = await getPortalLighting(session)
  const year = new Date().getFullYear()

  const ref = adminDb.collection('tenants').doc(ctx.tenantId).collection('rebookingRequests').doc()

  await ref.set({
    customerName: ctx.customerName,
    customerId: ctx.customerId,
    propertyName: ctx.propertyName,
    propertyId: ctx.propertyId,
    priorJobTitle: lighting.propertyName ? `${ctx.customerName} prior season` : '',
    requestedDate: input.preferredPeriod || `${year + 1}-11-01`,
    status: 'new',
    keepSameDesign: Boolean(input.keepSameDesign),
    changeRequest: input.changeRequest ? String(input.changeRequest) : null,
    preferredPeriod: input.preferredPeriod || null,
    seasonYear: year + 1,
    source: 'customer_portal',
    signerName: input.signerName || null,
    notes: input.keepSameDesign
      ? 'Customer requested same design renewal via portal'
      : `Customer requested changes: ${input.changeRequest || 'see change request'}`,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  // New season stub record linked to prior season (does not overwrite prior records)
  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('seasons')
    .add({
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      propertyId: ctx.propertyId,
      propertyName: ctx.propertyName,
      year: year + 1,
      status: 'renewal_requested',
      priorYear: year,
      rebookingRequestId: ref.id,
      source: 'customer_portal',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Renewal request — ${ctx.customerName}`,
      body: input.keepSameDesign
        ? 'Customer wants to keep the same design for next season.'
        : `Customer requested changes: ${input.changeRequest || ''}`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.renewal_requested',
    actor: { type: 'customer' },
    metadata: { rebookingRequestId: ref.id, keepSameDesign: Boolean(input.keepSameDesign) }
  })

  return getPortalRenewal(session)
}

export async function submitAddOnRequest(
  session: PortalSessionContext,
  input: { serviceArea: string; description: string }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.addOnRequests) {
    throw Object.assign(new Error('Add-on requests are not available'), { status: 403 })
  }

  const description = String(input.description || '').trim()
  const serviceArea = String(input.serviceArea || '').trim() || 'Other'

  if (description.length < 5) {
    throw Object.assign(new Error('Please describe the addition'), { status: 400 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const ref = adminDb.collection('tenants').doc(ctx.tenantId).collection('addOnRequests').doc()

  await ref.set({
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    propertyId: ctx.propertyId,
    propertyName: ctx.propertyName,
    serviceArea,
    description,
    status: 'pending_review',
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('messages')
    .add({
      to: 'office',
      channel: 'other',
      subject: `Add-on request — ${ctx.customerName}`,
      body: `${serviceArea}: ${description}`,
      status: 'sent',
      source: 'customer_portal',
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.addon_requested',
    actor: { type: 'customer' },
    metadata: { requestId: ref.id, serviceArea }
  })

  return { id: ref.id, status: 'pending_review' as const }
}

export async function listPortalProperties(session: PortalSessionContext) {
  const settings = await getTenantPortalSettings(session.tenantId)
  const ctx = await loadPortalCustomerContext(session)

  if (!settings.multipleProperties) {
    return {
      properties: ctx.property
        ? [
            {
              id: ctx.propertyId || '',
              name: ctx.propertyName || 'Property',
              address: [ctx.property.address, ctx.property.city].filter(Boolean).join(', '),
              selected: true
            }
          ]
        : [],
      canSwitch: false
    }
  }

  const snap = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('properties')
    .where('customerName', '==', ctx.customerName)
    .limit(20)
    .get()

  const properties = snap.docs.map(doc => {
    const data = doc.data()

    return {
      id: doc.id,
      name: String(data.name || 'Property'),
      address: [data.address, data.city, data.state].filter(Boolean).join(', '),
      selected: doc.id === ctx.propertyId
    }
  })

  return { properties, canSwitch: properties.length > 1 }
}

export async function switchPortalProperty(session: PortalSessionContext, propertyId: string) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.multipleProperties) {
    throw Object.assign(new Error('Multiple properties are not enabled'), { status: 403 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const prop = await adminDb.collection('tenants').doc(ctx.tenantId).collection('properties').doc(propertyId).get()

  if (!prop.exists) throw Object.assign(new Error('Property not found'), { status: 404 })

  const data = prop.data()!

  if (String(data.customerName || '') !== ctx.customerName && String(data.customerId || '') !== ctx.customerId) {
    throw Object.assign(new Error('Property not found'), { status: 404 })
  }

  await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('customerPortals')
    .doc(session.portal.id)
    .set({ primaryPropertyId: propertyId, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: session.portal.id,
    customerId: ctx.customerId,
    action: 'portal.property_switched',
    actor: { type: 'customer' },
    metadata: { propertyId }
  })

  return listPortalProperties({
    ...session,
    portal: { ...session.portal, primaryPropertyId: propertyId }
  })
}
