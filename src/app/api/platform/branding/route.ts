import { NextResponse } from 'next/server'

import {
  getPlatformBranding,
  removePlatformBrandingAsset,
  savePlatformBrandingAsset,
  updatePlatformBranding
} from '@libs/branding/storage'
import type { BrandingAssetKey } from '@libs/branding/types'
import { requirePlatformAdminApi } from '@libs/platform/api'

function parseAsset(value: FormDataEntryValue | null): BrandingAssetKey | null {
  if (value === 'logo' || value === 'logoDark' || value === 'favicon') return value

  return null
}

export async function GET() {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const branding = await getPlatformBranding()

  return NextResponse.json({ ok: true, branding })
}

export async function PUT(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const body = await request.json()
  const branding = await updatePlatformBranding(body)

  return NextResponse.json({ ok: true, branding })
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const asset = parseAsset(formData.get('asset'))
    const file = formData.get('file')

    if (!asset) {
      return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 })
    }

    const branding = await savePlatformBrandingAsset(asset, file)

    return NextResponse.json({ ok: true, branding })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status })
  }
}

export async function DELETE(request: Request) {
  const auth = await requirePlatformAdminApi()

  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const asset = parseAsset(searchParams.get('asset'))

  if (!asset) {
    return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
  }

  const branding = await removePlatformBrandingAsset(asset)

  return NextResponse.json({ ok: true, branding })
}
