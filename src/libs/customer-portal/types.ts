export type PortalStatus = 'pending' | 'active' | 'disabled' | 'revoked'
export type GrantStatus = 'active' | 'revoked' | 'expired'
export type AssuranceLevel = 1 | 2 | 3

export type CustomerPortalRecord = {
  id: string
  tenantId: string
  customerId: string
  primaryPropertyId: string | null
  shortCode: string
  status: PortalStatus
  portalNameOverride: string | null
  enabledFeatures: string[] | null
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  disabledAt?: string | null
  disabledBy?: string | null
  lastAccessAt?: string | null
  lastVerifiedAt?: string | null
}

export type CustomerPortalGrant = {
  id: string
  tenantId: string
  portalId: string
  tokenHash: string
  tokenPrefix: string
  status: GrantStatus
  issuedAt?: string
  expiresAt?: string | null
  lastUsedAt?: string | null
  revokedAt?: string | null
  revokedBy?: string | null
  revokeReason?: string | null
}

export type CustomerPortalSession = {
  id: string
  tenantId: string
  portalId: string
  grantId: string
  sessionTokenHash: string
  assuranceLevel: AssuranceLevel
  verifiedContactId: string | null
  createdAt?: string
  lastSeenAt?: string
  expiresAt?: string
  idleExpiresAt?: string
  revokedAt?: string | null
  riskFlags?: string[]
}

export type CustomerPortalFeatureSettings = {
  enabled: boolean
  myLighting: boolean
  photos: boolean
  schedule: boolean
  serviceRequests: boolean
  proposals: boolean
  onlinePayments: boolean
  agreements: boolean
  messages: boolean
  propertyInformation: boolean
  seasonalRenewal: boolean
  referrals: boolean
  reviews: boolean
  addOnRequests: boolean
  savedPaymentMethods: boolean
  autopay: boolean
  multipleProperties: boolean
  customerFileUploads: boolean
  technicianArrivalStatus: boolean
  showPoweredBy: boolean
  portalDisplayName: string | null
  welcomeMessage: string | null
  supportPhone: string | null
  supportEmail: string | null
  website: string | null
  footerText: string | null
  termsUrl: string | null
  privacyUrl: string | null
  renewalLabel: string | null
  removalLabel: string | null
  sessionIdleMinutes: number
  sessionAbsoluteHours: number
  forceVerificationForInvoices: boolean
  forceVerificationForDocuments: boolean
}

export type PortalPrimaryAction = {
  key: string
  message: string
  actionLabel: string
  href: string
}

export type PortalHomeDto = {
  contractorName: string
  portalName: string
  logoUrl: string | null
  primaryColor: string | null
  accentColor: string | null
  seasonLabel: string
  customerGreeting: string
  propertySummary: string | null
  status: {
    label: string
    detail: string | null
    date: string | null
  }
  primaryAction: PortalPrimaryAction
  balance: {
    amountCents: number
    dueDate: string | null
    invoiceNumber: string | null
    pastDue: boolean
  } | null
  recentActivity: Array<{ label: string; at: string | null }>
  features: {
    myLighting: boolean
    photos: boolean
    schedule: boolean
    serviceRequests: boolean
    proposals: boolean
    invoices: boolean
    agreements: boolean
    messages: boolean
    property: boolean
    renewal: boolean
  }
  showPoweredBy: boolean
  supportPhone: string | null
  supportEmail: string | null
}

export type PortalAdminSummary = {
  portal: CustomerPortalRecord | null
  shortUrl: string | null
  secureUrl: string | null
  grantPrefix: string | null
  tenantPortalEnabled: boolean
}

export type PortalPropertyDto = {
  name: string | null
  nickname: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  photoUrl: string | null
  primaryContact: string | null
  accessInstructions: string | null
  gateInfo: string | null
  powerSourceSummary: string | null
  timerLocation: string | null
  storagePreference: string | null
  petNotice: string | null
  preferredArrival: string | null
}
