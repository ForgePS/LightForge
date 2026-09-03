import 'server-only'

import type { DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import type { CustomerPortalRecord } from '@libs/customer-portal/types'
import type { PortalSessionContext } from '@libs/customer-portal/session'

export type PortalCustomerContext = {
  tenantId: string
  portal: CustomerPortalRecord
  customerId: string
  customerName: string
  customer: DocumentData
  propertyId: string | null
  property: DocumentData | null
  propertyName: string | null
  propertyNames: string[]
}

export function asIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybe = value as { toDate?: () => Date }

    if (typeof maybe.toDate === 'function') return maybe.toDate().toISOString()
  }

  return null
}

export async function loadPortalCustomerContext(session: PortalSessionContext): Promise<PortalCustomerContext> {
  const { tenantId, portal } = session
  const tenantRef = adminDb.collection('tenants').doc(tenantId)
  const customerSnap = await tenantRef.collection('customers').doc(portal.customerId).get()

  if (!customerSnap.exists) {
    throw Object.assign(new Error('Customer not found'), { status: 404 })
  }

  const customer = customerSnap.data()!
  const customerName = String(customer.name || '')

  let propertySnap = portal.primaryPropertyId
    ? await tenantRef.collection('properties').doc(portal.primaryPropertyId).get()
    : null

  if (!propertySnap?.exists && customerName) {
    const byName = await tenantRef.collection('properties').where('customerName', '==', customerName).limit(1).get()

    propertySnap = byName.empty ? null : byName.docs[0]!
  }

  const property = propertySnap?.exists ? propertySnap.data()! : null
  const propertyId = propertySnap?.exists ? propertySnap.id : null
  const propertyName = property ? String(property.name || '') : null

  const allProps = customerName
    ? await tenantRef.collection('properties').where('customerName', '==', customerName).limit(20).get()
    : { docs: [] as Array<{ id: string; data: () => DocumentData }> }

  const propertyNames = allProps.docs.map(doc => String(doc.data().name || '')).filter(Boolean)

  if (propertyName && !propertyNames.includes(propertyName)) {
    propertyNames.push(propertyName)
  }

  return {
    tenantId,
    portal,
    customerId: portal.customerId,
    customerName,
    customer,
    propertyId,
    property,
    propertyName,
    propertyNames
  }
}

export function belongsToPortalCustomer(
  record: DocumentData,
  ctx: PortalCustomerContext,
  options?: { propertyField?: string; customerNameField?: string; customerIdField?: string }
) {
  const propertyField = options?.propertyField || 'propertyName'
  const customerNameField = options?.customerNameField || 'customerName'
  const customerIdField = options?.customerIdField || 'customerId'

  if (record[customerIdField] && String(record[customerIdField]) === ctx.customerId) {
    return true
  }

  if (record[customerNameField] && String(record[customerNameField]) === ctx.customerName) {
    return true
  }

  const prop = record[propertyField]

  return Boolean(prop && ctx.propertyNames.includes(String(prop)))
}
