import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'

import type { PortalPropertyDto } from '@libs/customer-portal/types'

export type { PortalPropertyDto }

const CUSTOMER_PROPERTY_FIELDS = [
  'customerAccessInstructions',
  'gateInfo',
  'powerSourceSummary',
  'timerLocation',
  'storagePreference',
  'petNotice',
  'preferredArrival'
] as const

export async function getPortalProperty(session: PortalSessionContext): Promise<PortalPropertyDto> {
  const ctx = await loadPortalCustomerContext(session)
  const property = ctx.property

  if (!property) {
    return {
      name: null,
      nickname: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      photoUrl: null,
      primaryContact: ctx.customerName,
      accessInstructions: null,
      gateInfo: null,
      powerSourceSummary: null,
      timerLocation: null,
      storagePreference: null,
      petNotice: null,
      preferredArrival: null
    }
  }

  return {
    name: ctx.propertyName,
    nickname: property.nickname ? String(property.nickname) : ctx.propertyName,
    address: property.address ? String(property.address) : null,
    city: property.city ? String(property.city) : null,
    state: property.state ? String(property.state) : null,
    zip: property.zip ? String(property.zip) : null,
    photoUrl: property.customerPhotoUrl ? String(property.customerPhotoUrl) : null,
    primaryContact: ctx.customerName,
    // Never expose raw serviceNotes (staff-only). Only explicit customer-facing fields.
    accessInstructions: property.customerAccessInstructions ? String(property.customerAccessInstructions) : null,
    gateInfo: property.gateInfo ? String(property.gateInfo) : null,
    powerSourceSummary: property.powerSourceSummary ? String(property.powerSourceSummary) : null,
    timerLocation: property.timerLocation ? String(property.timerLocation) : null,
    storagePreference: property.storagePreference ? String(property.storagePreference) : null,
    petNotice: property.petNotice ? String(property.petNotice) : null,
    preferredArrival: property.preferredArrival ? String(property.preferredArrival) : null
  }
}

export async function requestPortalPropertyChange(
  session: PortalSessionContext,
  input: { field: string; value: string; note?: string }
) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.propertyInformation) {
    throw Object.assign(new Error('Property information is disabled'), { status: 403 })
  }

  const ctx = await loadPortalCustomerContext(session)

  if (!ctx.propertyId) {
    throw Object.assign(new Error('No property is linked to this portal'), { status: 400 })
  }

  const allowedImmediate = new Set(['petNotice', 'preferredArrival', 'storagePreference'])
  const field = String(input.field || '')
  const value = String(input.value || '').trim()

  if (!CUSTOMER_PROPERTY_FIELDS.includes(field as (typeof CUSTOMER_PROPERTY_FIELDS)[number])) {
    throw Object.assign(new Error('That property field cannot be updated here'), { status: 400 })
  }

  if (allowedImmediate.has(field)) {
    await adminDb
      .collection('tenants')
      .doc(ctx.tenantId)
      .collection('properties')
      .doc(ctx.propertyId)
      .set({ [field]: value, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

    await writePortalAuditEvent({
      tenantId: ctx.tenantId,
      portalId: ctx.portal.id,
      customerId: ctx.customerId,
      action: 'portal.property_updated',
      actor: { type: 'customer' },
      metadata: { field }
    })

    return { status: 'updated' as const, field }
  }

  const reqRef = adminDb.collection('tenants').doc(ctx.tenantId).collection('propertyChangeRequests').doc()

  await reqRef.set({
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    propertyId: ctx.propertyId,
    propertyName: ctx.propertyName,
    field,
    requestedValue: value,
    note: input.note ? String(input.note) : null,
    status: 'pending',
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: ctx.portal.id,
    customerId: ctx.customerId,
    action: 'portal.property_change_requested',
    actor: { type: 'customer' },
    metadata: { field, requestId: reqRef.id }
  })

  return { status: 'pending_review' as const, field }
}

export async function listPortalProperty(session: PortalSessionContext) {
  const dto = await getPortalProperty(session)
  const ctx = await loadPortalCustomerContext(session)
  const pending = await adminDb
    .collection('tenants')
    .doc(ctx.tenantId)
    .collection('propertyChangeRequests')
    .where('customerId', '==', ctx.customerId)
    .limit(10)
    .get()
    .catch(() => null)

  return {
    property: dto,
    pendingChanges: pending
      ? pending.docs
          .map(doc => doc.data())
          .filter(row => row.status === 'pending')
          .map(row => ({
            field: String(row.field),
            requestedValue: String(row.requestedValue || ''),
            createdAt: asIso(row.createdAt)
          }))
      : []
  }
}

export { belongsToPortalCustomer }
