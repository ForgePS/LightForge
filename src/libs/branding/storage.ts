import 'server-only'

import path from 'path'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb, adminStorage } from '@libs/firebase/admin'
import {
  BRANDING_ASSET_FIELDS,
  DEFAULT_BRANDING,
  normalizeBranding,
  type BrandingAssetKey,
  type BrandingSettings
} from '@libs/branding/types'

const ALLOWED_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon'
])

const MAX_BYTES: Record<BrandingAssetKey, number> = {
  logo: 5 * 1024 * 1024,
  logoDark: 5 * 1024 * 1024,
  favicon: 512 * 1024
}

function storagePath(scope: 'platform' | { tenantId: string }, asset: BrandingAssetKey, ext: string) {
  const safeExt = ext.startsWith('.') ? ext : `.${ext}`

  if (scope === 'platform') {
    return `branding/platform/${asset}${safeExt}`
  }

  return `branding/tenants/${scope.tenantId}/${asset}${safeExt}`
}

function extFromFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase()

  return ext || '.png'
}

function publicUrl(bucketName: string, objectPath: string) {
  return `https://storage.googleapis.com/${bucketName}/${objectPath}`
}

export function validateBrandingUpload(asset: BrandingAssetKey, file: File) {
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    throw Object.assign(new Error('Unsupported file type. Use PNG, JPG, SVG, WEBP, or ICO.'), { status: 400 })
  }

  if (file.size > MAX_BYTES[asset]) {
    const limitMb = MAX_BYTES[asset] / (1024 * 1024)

    throw Object.assign(new Error(`File is too large. Maximum size is ${limitMb} MB.`), { status: 400 })
  }
}

export async function uploadBrandingAsset(
  scope: 'platform' | { tenantId: string },
  asset: BrandingAssetKey,
  file: File
): Promise<string> {
  validateBrandingUpload(asset, file)

  const bucket = adminStorage.bucket()
  const ext = extFromFileName(file.name)
  const objectPath = storagePath(scope, asset, ext)
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileRef = bucket.file(objectPath)

  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000'
    },
    resumable: false
  })

  try {
    await fileRef.makePublic()
  } catch {
    // Uniform bucket-level access may block object ACLs; public URL still works when bucket IAM allows it.
  }

  return publicUrl(bucket.name, objectPath)
}

async function readPlatformBrandingDoc() {
  const snap = await adminDb.collection('platformSettings').doc('general').get()
  const data = snap.data() || {}

  return normalizeBranding(data.branding)
}

async function readTenantBrandingDoc(tenantId: string) {
  const snap = await adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general').get()
  const data = snap.data() || {}

  return normalizeBranding(data.branding)
}

export async function getPlatformBranding(): Promise<BrandingSettings> {
  return readPlatformBrandingDoc()
}

export async function getTenantBranding(tenantId: string): Promise<BrandingSettings> {
  return readTenantBrandingDoc(tenantId)
}

export async function updatePlatformBranding(branding: Partial<BrandingSettings>) {
  const current = await readPlatformBrandingDoc()

  await adminDb.collection('platformSettings').doc('general').set(
    {
      branding: { ...current, ...branding },
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  return getPlatformBranding()
}

export async function updateTenantBranding(tenantId: string, branding: Partial<BrandingSettings>) {
  const current = await readTenantBrandingDoc(tenantId)

  await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('settings')
    .doc('general')
    .set(
      {
        branding: { ...current, ...branding },
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )

  return getTenantBranding(tenantId)
}

export async function savePlatformBrandingAsset(asset: BrandingAssetKey, file: File) {
  const url = await uploadBrandingAsset('platform', asset, file)
  const field = BRANDING_ASSET_FIELDS[asset]

  return updatePlatformBranding({ [field]: url })
}

export async function saveTenantBrandingAsset(tenantId: string, asset: BrandingAssetKey, file: File) {
  const url = await uploadBrandingAsset({ tenantId }, asset, file)
  const field = BRANDING_ASSET_FIELDS[asset]

  return updateTenantBranding(tenantId, { [field]: url })
}

export async function removePlatformBrandingAsset(asset: BrandingAssetKey) {
  const field = BRANDING_ASSET_FIELDS[asset]

  return updatePlatformBranding({ [field]: null })
}

export async function removeTenantBrandingAsset(tenantId: string, asset: BrandingAssetKey) {
  const field = BRANDING_ASSET_FIELDS[asset]

  return updateTenantBranding(tenantId, { [field]: null })
}

export function emptyBranding(): BrandingSettings {
  return { ...DEFAULT_BRANDING }
}
