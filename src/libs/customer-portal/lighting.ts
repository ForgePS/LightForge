import 'server-only'

import type { DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext,
  type PortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'

export type PortalLightingItem = {
  id: string
  name: string
  serviceArea: string
  description: string | null
  productType: string | null
  lightType: string | null
  color: string | null
  quantity: number | null
  linearFeet: number | null
  installationLocation: string | null
  customerNotes: string | null
  status: string | null
}

const AREA_ORDER = [
  'Roofline',
  'Trees',
  'Bushes',
  'Columns',
  'Wreaths',
  'Garland',
  'Ground displays',
  'Walkways',
  'Entryway',
  'Backyard',
  'Commercial façade',
  'Interior display',
  'Custom area',
  'Other'
]

function mapLightingItem(id: string, data: DocumentData): PortalLightingItem {
  return {
    id,
    name: String(data.name || data.itemName || 'Lighting item'),
    serviceArea: String(data.serviceArea || 'Other'),
    description: data.description ? String(data.description) : null,
    productType: data.productType ? String(data.productType) : null,
    lightType: data.lightType ? String(data.lightType) : null,
    color: data.color ? String(data.color) : null,
    quantity: data.quantity != null ? Number(data.quantity) : null,
    linearFeet: data.linearFeet != null ? Number(data.linearFeet) : null,
    installationLocation: data.installationLocation ? String(data.installationLocation) : null,
    customerNotes: data.customerNotes
      ? String(data.customerNotes)
      : data.customerSummary
        ? String(data.customerSummary)
        : null,
    status: data.status ? String(data.status) : null
  }
}

async function lightingFromCollection(ctx: PortalCustomerContext) {
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('lightingItems').limit(200).get()

  return snap.docs
    .filter(doc => {
      const data = doc.data()

      if (data.customerVisible === false || data.customerVisible === 'false') return false

      return belongsToPortalCustomer(data, ctx)
    })
    .map(doc => mapLightingItem(doc.id, doc.data()))
}

async function lightingFromStorageFallback(ctx: PortalCustomerContext) {
  const snap = await adminDb.collection('tenants').doc(ctx.tenantId).collection('customerStorage').limit(100).get()

  return snap.docs
    .filter(doc => belongsToPortalCustomer(doc.data(), ctx))
    .map(doc => {
      const data = doc.data()

      return mapLightingItem(doc.id, {
        name: data.itemName,
        serviceArea: 'Storage',
        description: data.notes ? String(data.notes) : null,
        quantity: data.quantity,
        status: 'In storage',
        customerVisible: true
      })
    })
}

export async function getPortalLighting(session: PortalSessionContext) {
  const ctx = await loadPortalCustomerContext(session)
  let items = await lightingFromCollection(ctx)

  if (items.length === 0) {
    items = await lightingFromStorageFallback(ctx)
  }

  const groups = new Map<string, PortalLightingItem[]>()

  for (const item of items) {
    const list = groups.get(item.serviceArea) || []

    list.push(item)
    groups.set(item.serviceArea, list)
  }

  const orderedAreas = [
    ...AREA_ORDER.filter(area => groups.has(area)),
    ...[...groups.keys()].filter(area => !AREA_ORDER.includes(area)).sort()
  ]

  return {
    propertyName: ctx.propertyName,
    propertySummary: ctx.property
      ? [ctx.property.address, ctx.property.city, ctx.property.state].filter(Boolean).join(', ')
      : null,
    groups: orderedAreas.map(area => ({
      serviceArea: area,
      items: groups.get(area) || []
    })),
    updatedAt: items.length ? asIso(new Date().toISOString()) : null
  }
}
