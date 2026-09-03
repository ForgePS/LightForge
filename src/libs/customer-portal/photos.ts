import 'server-only'

import { randomBytes } from 'crypto'
import path from 'path'

import { FieldValue, type DocumentData } from 'firebase-admin/firestore'

import { adminDb, adminStorage, getStorageBucketName } from '@libs/firebase/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'
import { writePortalAuditEvent } from '@libs/customer-portal/audit'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'

export type PortalPhoto = {
  id: string
  title: string
  category: string
  url: string
  caption: string | null
  capturedAt: string | null
  altText: string | null
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
const MAX_BYTES = 8 * 1024 * 1024

function mapPhoto(id: string, data: DocumentData): PortalPhoto {
  return {
    id,
    title: String(data.title || data.name || 'Photo'),
    category: String(data.category || 'Property reference'),
    url: String(data.url || data.assetUrl || ''),
    caption: data.caption ? String(data.caption) : data.customerSummary ? String(data.customerSummary) : null,
    capturedAt: asIso(data.capturedAt) || asIso(data.createdAt) || null,
    altText: data.altText ? String(data.altText) : String(data.title || 'Customer photo')
  }
}

export async function getPortalPhotos(session: PortalSessionContext) {
  const ctx = await loadPortalCustomerContext(session)
  const tenantRef = adminDb.collection('tenants').doc(ctx.tenantId)

  const [photosSnap, mockupsSnap] = await Promise.all([
    tenantRef.collection('photos').limit(200).get(),
    tenantRef.collection('mockups').limit(100).get()
  ])

  const photos: PortalPhoto[] = []

  for (const doc of photosSnap.docs) {
    const data = doc.data()

    if (data.customerVisible === false || data.customerVisible === 'false') continue
    if (!belongsToPortalCustomer(data, ctx)) continue
    if (!data.url && !data.assetUrl) continue

    photos.push(mapPhoto(doc.id, data))
  }

  for (const doc of mockupsSnap.docs) {
    const data = doc.data()

    if (!['shared', 'approved'].includes(String(data.status || ''))) continue
    if (!belongsToPortalCustomer(data, ctx, { propertyField: 'propertyName' })) continue
    if (!data.assetUrl) continue

    photos.push(
      mapPhoto(doc.id, {
        ...data,
        title: data.title,
        category: 'Design preview',
        url: data.assetUrl,
        caption: null,
        customerVisible: true
      })
    )
  }

  photos.sort((a, b) => String(b.capturedAt || '').localeCompare(String(a.capturedAt || '')))

  const categories = [...new Set(photos.map(photo => photo.category))]

  return { photos, categories, propertyName: ctx.propertyName }
}

export async function uploadPortalServicePhoto(session: PortalSessionContext, file: File) {
  const settings = await getTenantPortalSettings(session.tenantId)

  if (!settings.customerFileUploads) {
    throw Object.assign(new Error('File uploads are disabled'), { status: 403 })
  }

  if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith('image/')) {
    throw Object.assign(new Error('Please upload a common mobile image format'), { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    throw Object.assign(new Error('Image must be 8 MB or smaller'), { status: 400 })
  }

  const ctx = await loadPortalCustomerContext(session)
  const ext = path.extname(file.name).toLowerCase() || '.jpg'
  const objectPath = `tenants/${ctx.tenantId}/portal-uploads/${ctx.customerId}/${Date.now()}-${randomBytes(6).toString('hex')}${ext}`
  const bucket = adminStorage.bucket(getStorageBucketName())
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileRef = bucket.file(objectPath)

  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type || 'image/jpeg',
      cacheControl: 'private, max-age=3600',
      metadata: {
        tenantId: ctx.tenantId,
        customerId: ctx.customerId,
        source: 'customer_portal'
      }
    },
    resumable: false
  })

  // Prefer signed URL; fall back to public object URL if signing is unavailable locally.
  let url: string

  try {
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    url = signedUrl
  } catch {
    try {
      await fileRef.makePublic()
    } catch {
      // Bucket may use uniform access.
    }

    url = `https://storage.googleapis.com/${bucket.name}/${objectPath}`
  }

  const photoRef = adminDb.collection('tenants').doc(ctx.tenantId).collection('photos').doc()

  await photoRef.set({
    title: 'Customer service photo',
    category: 'Service issue',
    url,
    storagePath: objectPath,
    caption: null,
    altText: 'Customer-uploaded service photo',
    customerVisible: true,
    customerId: ctx.customerId,
    customerName: ctx.customerName,
    propertyId: ctx.propertyId,
    propertyName: ctx.propertyName,
    source: 'customer_portal',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    capturedAt: FieldValue.serverTimestamp()
  })

  await writePortalAuditEvent({
    tenantId: ctx.tenantId,
    portalId: ctx.portal.id,
    customerId: ctx.customerId,
    action: 'portal.photo_uploaded',
    actor: { type: 'customer' },
    metadata: { photoId: photoRef.id, category: 'Service issue' }
  })

  return mapPhoto(photoRef.id, {
    title: 'Customer service photo',
    category: 'Service issue',
    url,
    altText: 'Customer-uploaded service photo',
    capturedAt: new Date().toISOString()
  })
}
