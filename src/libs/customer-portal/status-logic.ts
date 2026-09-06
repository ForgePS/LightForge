import type { PortalPrimaryAction } from '@libs/customer-portal/types'

export type PortalStatusStage =
  | 'proposal'
  | 'deposit'
  | 'install_scheduled'
  | 'install_progress'
  | 'install_complete'
  | 'active'
  | 'service_open'
  | 'removal'
  | 'storage'
  | 'renewal'

export type DerivedPortalStatus = {
  label: string
  detail: string | null
  date: string | null
  stage: PortalStatusStage
}

function asIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybe = value as { toDate?: () => Date }

    if (typeof maybe.toDate === 'function') return maybe.toDate().toISOString()
  }

  return null
}

type StatusRecord = Record<string, unknown>

export function derivePortalStatus(input: {
  proposals: StatusRecord[]
  jobs: StatusRecord[]
  issues: StatusRecord[]
  invoices: StatusRecord[]
  rebooking: StatusRecord[]
  removalLabel: string
}): DerivedPortalStatus {
  const openIssue = input.issues.find(i => i.status !== 'resolved')

  if (openIssue) {
    return {
      label: 'SERVICE REQUEST OPEN',
      detail: String(openIssue.title || 'We are working on your request'),
      date: asIso(openIssue.updatedAt) || asIso(openIssue.createdAt),
      stage: 'service_open'
    }
  }

  const installInProgress = input.jobs.find(j => j.type === 'install' && j.status === 'in_progress')

  if (installInProgress) {
    return {
      label: 'INSTALLATION IN PROGRESS',
      detail: 'Your installation is underway',
      date: String(installInProgress.scheduledDate || '') || null,
      stage: 'install_progress'
    }
  }

  const installScheduled = input.jobs.find(j => j.type === 'install' && j.status === 'scheduled')

  if (installScheduled) {
    return {
      label: 'INSTALLATION SCHEDULED',
      detail: 'Arrival details will appear here when available',
      date: String(installScheduled.scheduledDate || '') || null,
      stage: 'install_scheduled'
    }
  }

  const removalScheduled = input.jobs.find(
    j => (j.type === 'takedown' || j.type === 'removal') && ['scheduled', 'in_progress'].includes(String(j.status))
  )

  if (removalScheduled) {
    return {
      label: `${input.removalLabel.toUpperCase()} SCHEDULED`,
      detail: `Your ${input.removalLabel.toLowerCase()} is scheduled`,
      date: String(removalScheduled.scheduledDate || '') || null,
      stage: 'removal'
    }
  }

  const sentProposal = input.proposals.find(p => p.status === 'sent')

  if (sentProposal) {
    return {
      label: 'PROPOSAL READY',
      detail: String(sentProposal.title || 'Your lighting proposal is ready'),
      date: asIso(sentProposal.updatedAt),
      stage: 'proposal'
    }
  }

  const unpaid = input.invoices.find(i => ['sent', 'open', 'partially_paid'].includes(String(i.status)))

  if (unpaid) {
    return {
      label: 'BALANCE DUE',
      detail: unpaid.number ? `Invoice ${unpaid.number}` : 'A payment is due',
      date: String(unpaid.dueDate || '') || null,
      stage: 'deposit'
    }
  }

  const installComplete = input.jobs.find(j => j.type === 'install' && j.status === 'complete')

  if (installComplete) {
    const renewal = input.rebooking.find(r => ['new', 'contacted'].includes(String(r.status)))

    if (renewal) {
      return {
        label: 'RENEWAL AVAILABLE',
        detail: 'Reserve your next season',
        date: String(renewal.requestedDate || '') || null,
        stage: 'renewal'
      }
    }

    return {
      label: 'LIGHTS INSTALLED',
      detail: 'Your Christmas lights are installed',
      date: String(installComplete.scheduledDate || '') || asIso(installComplete.updatedAt),
      stage: 'install_complete'
    }
  }

  const storageHint = input.jobs.some(j => j.type === 'takedown' && j.status === 'complete')

  if (storageHint) {
    return {
      label: 'IN STORAGE',
      detail: 'Your lights are safely stored',
      date: null,
      stage: 'storage'
    }
  }

  return {
    label: 'ACTIVE SEASON',
    detail: 'Need help with your lights?',
    date: null,
    stage: 'active'
  }
}

export function portalPrimaryAction(
  stage: PortalStatusStage,
  renewalLabel: string,
  removalLabel: string
): PortalPrimaryAction {
  switch (stage) {
    case 'proposal':
      return {
        key: 'proposal',
        message: 'Your lighting proposal is ready',
        actionLabel: 'View Proposal',
        href: '/portal/proposals'
      }
    case 'deposit':
      return { key: 'pay', message: 'Your balance is due', actionLabel: 'Pay Now', href: '/portal/invoices' }
    case 'install_scheduled':
      return {
        key: 'schedule',
        message: 'Your installation is scheduled',
        actionLabel: 'View Schedule',
        href: '/portal/schedule'
      }
    case 'install_progress':
      return {
        key: 'status',
        message: 'Your installation is underway',
        actionLabel: 'View Status',
        href: '/portal/schedule'
      }
    case 'install_complete':
      return {
        key: 'photos',
        message: 'Your Christmas lights are installed',
        actionLabel: 'View Photos',
        href: '/portal/photos'
      }
    case 'service_open':
      return {
        key: 'track',
        message: 'We are working on your request',
        actionLabel: 'Track Request',
        href: '/portal/service'
      }
    case 'removal':
      return {
        key: 'removal',
        message: `Your ${removalLabel.toLowerCase()} is scheduled`,
        actionLabel: `View ${removalLabel} Date`,
        href: '/portal/schedule'
      }
    case 'storage':
      return {
        key: 'summary',
        message: 'Your lights are safely stored',
        actionLabel: 'View Season Summary',
        href: '/portal/home'
      }
    case 'renewal':
      return { key: 'renew', message: 'Reserve your next season', actionLabel: renewalLabel, href: '/portal/renewal' }
    default:
      return {
        key: 'service',
        message: 'Need help with your lights?',
        actionLabel: 'Request Service',
        href: '/portal/service/new'
      }
  }
}
