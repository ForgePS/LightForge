import { NextResponse } from 'next/server'

import {
  getTenantBranding,
  removeTenantBrandingAsset,
  saveTenantBrandingAsset,
  updateTenantBranding
} from '@libs/branding/storage'
import type { BrandingAssetKey } from '@libs/branding/types'
import { requireActiveTenantContext } from '@libs/modules/crud'

function parseAsset(value: FormDataEntryValue | null): BrandingAssetKey | null {
  if (value === 'logo' || value === 'logoDark' || value === 'favicon') return value

  return null
}

export async function GET() {
  try {
    const ctx = await requireActiveTenantContext()
    const branding = await getTenantBranding(ctx.tenantId)

    return NextResponse.json({ ok: true, branding })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const branding = await updateTenantBranding(ctx.tenantId, body)

    return NextResponse.json({ ok: true, branding })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const asset = parseAsset(formData.get('asset'))
    const file = formData.get('file')

    if (!asset) {
      return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 })
    }

    const branding = await saveTenantBrandingAsset(ctx.tenantId, asset, file)

    return NextResponse.json({ ok: true, branding })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireActiveTenantContext()

    if (!['owner', 'admin'].includes(ctx.role) && !ctx.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const asset = parseAsset(searchParams.get('asset'))

    if (!asset) {
      return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
    }

    const branding = await removeTenantBrandingAsset(ctx.tenantId, asset)

    return NextResponse.json({ ok: true, branding })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
