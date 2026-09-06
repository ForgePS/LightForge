export function mapPortalInvoiceStatus(status: string, dueDate: string | null, amountDueCents: number) {
  const today = new Date().toISOString().slice(0, 10)

  if (status === 'paid') return 'Paid'
  if (status === 'void' || status === 'voided') return 'Voided'
  if (status === 'refunded') return 'Refunded'
  if (status === 'partially_paid') return 'Partially paid'
  if (amountDueCents > 0 && dueDate && dueDate < today) return 'Past due'
  if (status === 'sent' || status === 'open') return 'Open'

  return 'Unavailable'
}

export function mapPortalServiceStatus(internal: string): string {
  switch (internal) {
    case 'open':
    case 'new':
      return 'Submitted'
    case 'accepted':
    case 'received':
      return 'Received'
    case 'scheduled':
    case 'assigned':
      return 'Scheduled'
    case 'en_route':
      return 'Technician En Route'
    case 'in_progress':
      return 'In Progress'
    case 'resolved':
    case 'complete':
    case 'completed':
      return 'Completed'
    case 'waiting_on_customer':
      return 'Action Needed'
    case 'canceled':
    case 'cancelled':
      return 'Canceled'
    default:
      return 'Submitted'
  }
}

export function effectiveAssuranceLevel(input: {
  sessionLevel: number
  minLevel: number
  assuranceLevelExpiresAt?: string | null
  nowMs?: number
}) {
  const now = input.nowMs ?? Date.now()
  const stepUpExpires = input.assuranceLevelExpiresAt ? new Date(input.assuranceLevelExpiresAt).getTime() : 0
  const stepUpValid = !stepUpExpires || stepUpExpires > now
  const effective = input.minLevel >= 3 ? (stepUpValid ? input.sessionLevel : Math.min(input.sessionLevel, 2)) : input.sessionLevel

  return {
    effective,
    allowed: effective >= input.minLevel
  }
}
