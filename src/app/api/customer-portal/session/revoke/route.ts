import { NextResponse } from 'next/server'

import { revokeCurrentPortalSession } from '@libs/customer-portal/session'

export async function POST() {
  try {
    await revokeCurrentPortalSession()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to sign out' },
      { status: 500 }
    )
  }
}
