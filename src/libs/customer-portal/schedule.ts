import 'server-only'

import type { DocumentData } from 'firebase-admin/firestore'

import { adminDb } from '@libs/firebase/admin'
import { getTenantPortalSettings } from '@libs/customer-portal/admin'
import {
  asIso,
  belongsToPortalCustomer,
  loadPortalCustomerContext
} from '@libs/customer-portal/context'
import type { PortalSessionContext } from '@libs/customer-portal/session'

export type PortalAppointment = {
  id: string
  type: string
  title: string
  date: string | null
  arrivalWindow: string | null
  address: string | null
  status: string
  preparationInstructions: string | null
  weatherNotice: string | null
  technicianEnRoute: boolean
  crewFirstName: string | null
}

export type PortalTimelineItem = {
  key: string
  label: string
  at: string | null
  complete: boolean
  current: boolean
}

function jobTypeLabel(type: string, removalLabel: string) {
  if (type === 'install') return 'Installation'
  if (type === 'service') return 'Service'
  if (type === 'takedown' || type === 'removal') return removalLabel

  return 'Appointment'
}

function mapJobStatus(status: string) {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'en_route':
      return 'Technician en route'
    case 'in_progress':
      return 'In Progress'
    case 'complete':
      return 'Completed'
    case 'cancelled':
      return 'Canceled'
    default:
      return 'Upcoming'
  }
}

export async function getPortalSchedule(session: PortalSessionContext) {
  const ctx = await loadPortalCustomerContext(session)
  const settings = await getTenantPortalSettings(ctx.tenantId)
  const removalLabel = settings.removalLabel || 'Removal'
  const tenantRef = adminDb.collection('tenants').doc(ctx.tenantId)

  const [jobsSnap, scheduleSnap, proposalsSnap, issuesSnap] = await Promise.all([
    tenantRef.collection('jobs').limit(100).get(),
    tenantRef.collection('scheduleEvents').limit(100).get(),
    tenantRef.collection('proposals').limit(50).get(),
    tenantRef.collection('serviceIssues').limit(50).get()
  ])

  const jobs = jobsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(job => belongsToPortalCustomer(job, ctx))

  const events = scheduleSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as DocumentData & { id: string })
    .filter(event => {
      if (belongsToPortalCustomer(event, ctx)) return true

      return jobs.some(job => String(job.title || '') === String(event.jobTitle || ''))
    })

  const address = ctx.property
    ? [ctx.property.address, ctx.property.city, ctx.property.state, ctx.property.zip].filter(Boolean).join(', ')
    : null

  const appointments: PortalAppointment[] = []

  for (const job of jobs) {
    if (['cancelled'].includes(String(job.status))) continue

    const enRoute = settings.technicianArrivalStatus && (job.technicianEnRoute === true || job.status === 'en_route')

    appointments.push({
      id: job.id,
      type: jobTypeLabel(String(job.type || ''), removalLabel),
      title: String(job.title || jobTypeLabel(String(job.type || ''), removalLabel)),
      date: job.scheduledDate ? String(job.scheduledDate) : null,
      arrivalWindow: job.arrivalWindow ? String(job.arrivalWindow) : null,
      address,
      status: enRoute ? 'Technician en route' : mapJobStatus(String(job.status || '')),
      preparationInstructions: job.customerPrepNotes ? String(job.customerPrepNotes) : null,
      weatherNotice: job.weatherNotice ? String(job.weatherNotice) : null,
      technicianEnRoute: Boolean(enRoute),
      crewFirstName: settings.technicianArrivalStatus && job.crewFirstName ? String(job.crewFirstName) : null
    })
  }

  for (const event of events) {
    if (appointments.some(a => a.title === String(event.title || '') && a.date === String(event.date || ''))) {
      continue
    }

    appointments.push({
      id: event.id,
      type: 'Scheduled visit',
      title: String(event.title || 'Scheduled visit'),
      date: event.date ? String(event.date) : null,
      arrivalWindow: event.startTime ? String(event.startTime) : null,
      address,
      status: 'Scheduled',
      preparationInstructions: null,
      weatherNotice: null,
      technicianEnRoute: false,
      crewFirstName: null
    })
  }

  appointments.sort((a, b) => String(a.date || '9999').localeCompare(String(b.date || '9999')))

  const proposals = proposalsSnap.docs.map(doc => doc.data()).filter(p => belongsToPortalCustomer(p, ctx))
  const issues = issuesSnap.docs.map(doc => doc.data()).filter(i => belongsToPortalCustomer(i, ctx))

  const timeline = buildTimeline({
    proposals,
    jobs,
    issues,
    removalLabel
  })

  return {
    propertyName: ctx.propertyName,
    address,
    appointments,
    timeline,
    technicianArrivalEnabled: settings.technicianArrivalStatus
  }
}

function buildTimeline(input: {
  proposals: DocumentData[]
  jobs: DocumentData[]
  issues: DocumentData[]
  removalLabel: string
}): PortalTimelineItem[] {
  const proposal = input.proposals.find(p => p.status !== 'draft')
  const install = input.jobs.find(j => j.type === 'install')
  const removal = input.jobs.find(j => j.type === 'takedown' || j.type === 'removal')
  const openIssue = input.issues.find(i => i.status !== 'resolved')

  const items: PortalTimelineItem[] = [
    {
      key: 'proposal',
      label: 'Proposal',
      at: proposal ? asIso(proposal.updatedAt) : null,
      complete: Boolean(proposal && ['sent', 'accepted'].includes(String(proposal.status))),
      current: false
    },
    {
      key: 'install_scheduled',
      label: 'Installation scheduled',
      at: install?.scheduledDate ? String(install.scheduledDate) : null,
      complete: Boolean(install && ['scheduled', 'in_progress', 'complete'].includes(String(install.status))),
      current: false
    },
    {
      key: 'install_complete',
      label: 'Installation complete',
      at: install?.status === 'complete' ? String(install.scheduledDate || '') || asIso(install.updatedAt) : null,
      complete: Boolean(install && install.status === 'complete'),
      current: false
    },
    {
      key: 'active',
      label: 'Active service season',
      at: null,
      complete: Boolean(install && install.status === 'complete'),
      current: false
    },
    {
      key: 'removal',
      label: `${input.removalLabel} scheduled`,
      at: removal?.scheduledDate ? String(removal.scheduledDate) : null,
      complete: Boolean(removal && ['scheduled', 'in_progress', 'complete'].includes(String(removal.status))),
      current: false
    },
    {
      key: 'storage',
      label: 'Storage',
      at: removal?.status === 'complete' ? asIso(removal.updatedAt) : null,
      complete: Boolean(removal && removal.status === 'complete'),
      current: false
    }
  ]

  if (openIssue) {
    items.splice(4, 0, {
      key: 'service',
      label: 'Service request open',
      at: asIso(openIssue.updatedAt) || asIso(openIssue.createdAt),
      complete: false,
      current: true
    })
  }

  const firstIncomplete = items.findIndex(item => !item.complete)

  if (firstIncomplete >= 0 && !items.some(item => item.current)) {
    items[firstIncomplete]!.current = true
  }

  return items
}
