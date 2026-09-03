import { NextResponse } from 'next/server'

import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  PROBLEM_LOCATIONS,
  PROBLEM_TYPES,
  createPortalServiceRequest,
  listPortalServiceRequests
} from '@libs/customer-portal/serviceRequests'
import { requirePortalSession } from '@libs/customer-portal/session'

export async function GET() {
  try {
    const session = await requirePortalSession()
    const settings = await getTenantPortalSettings(session.tenantId)

    if (!settings.serviceRequests) {
      return NextResponse.json({ error: 'Service requests are not available' }, { status: 403 })
    }

    const data = await listPortalServiceRequests(session)

    return NextResponse.json({
      ok: true,
      ...data,
      formOptions: {
        problemTypes: PROBLEM_TYPES,
        problemLocations: PROBLEM_LOCATIONS
      }
    })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession()
    const body = await request.json()
    const created = await createPortalServiceRequest(session, {
      problemType: String(body.problemType || ''),
      problemLocation: String(body.problemLocation || ''),
      description: String(body.description || ''),
      startedAt: body.startedAt ? String(body.startedAt) : undefined,
      preferredContactMethod: body.preferredContactMethod ? String(body.preferredContactMethod) : undefined,
      accessIfAway: Boolean(body.accessIfAway),
      availability: body.availability ? String(body.availability) : undefined,
      safetyAcknowledged: Boolean(body.safetyAcknowledged),
      photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls.map(String) : [],
      idempotencyKey: body.idempotencyKey ? String(body.idempotencyKey) : undefined
    })

    return NextResponse.json({ ok: true, request: created })
  } catch (error) {
    const status = (error as { status?: number }).status || 500

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status })
  }
}
