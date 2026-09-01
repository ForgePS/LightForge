export type TenantStatus = 'trial' | 'active' | 'suspended'
export type MemberRole = 'owner' | 'admin' | 'member'

export type SubscriptionPlanId = 'trial' | 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
export type BillingInterval = 'month' | 'year'

export type SubscriptionPlan = {
  id: SubscriptionPlanId
  name: string
  description: string
  monthlyPriceCents: number
  yearlyPriceCents: number
  includedSeats: number
  features: string[]
  active: boolean
}

export type TenantSubscription = {
  planId: SubscriptionPlanId
  status: SubscriptionStatus
  billingInterval: BillingInterval
  seats: number
  priceCents: number | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  cancelAtPeriodEnd: boolean
  notes: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export type UserProfile = {
  uid: string
  email: string
  displayName: string
  activeTenantId: string | null
  isPlatformAdmin?: boolean
  createdAt: Date | { seconds: number; nanoseconds: number }
  updatedAt: Date | { seconds: number; nanoseconds: number }
}

export type Tenant = {
  id: string
  name: string
  slug: string
  status: TenantStatus
  isTemplate: boolean
  createdFromTemplateId: string | null
  subscription: TenantSubscription
  createdAt: Date | { seconds: number; nanoseconds: number }
  updatedAt: Date | { seconds: number; nanoseconds: number }
}

export type TenantMember = {
  uid: string
  email: string
  displayName: string
  role: MemberRole
  joinedAt: Date | { seconds: number; nanoseconds: number }
}

export type TenantTemplate = {
  id: string
  name: string
  sourceTenantId: string
  seed: {
    sampleItems: Array<{ title: string; status: string }>
  }
  createdAt: Date | { seconds: number; nanoseconds: number }
  updatedAt: Date | { seconds: number; nanoseconds: number }
}

export type SessionUser = {
  uid: string
  email: string
  displayName: string
  activeTenantId: string | null
  isPlatformAdmin: boolean
}

export type ActiveTenantInfo = {
  id: string
  name: string
  slug: string
  status: TenantStatus
  role: MemberRole
  subscriptionStatus?: SubscriptionStatus
  planId?: SubscriptionPlanId
  seats?: number
}

export type PlatformTenantSummary = {
  id: string
  name: string
  slug: string
  status: TenantStatus
  isTemplate: boolean
  memberCount: number
  subscription: TenantSubscription
  archivedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type PlatformUserSummary = {
  uid: string
  email: string
  displayName: string
  activeTenantId: string | null
  isPlatformAdmin: boolean
  membershipCount: number
  createdAt: string | null
}

export type PlatformAdminRecord = {
  uid: string
  email: string
  createdAt: string | null
}

export type TenantTemplateSummary = {
  id: string
  name: string
  sourceTenantId: string
  sourceTenantName: string | null
  createdAt: string | null
}

export type PlatformSettings = {
  supportEmail: string
  maintenanceMode: boolean
  defaultTrialDays: number
  allowSelfServeSignup: boolean
  platformName: string
}

export type TenantModuleCount = {
  collection: string
  title: string
  count: number
}

export type BillingOverview = {
  byStatus: Record<string, number>
  pastDueTenants: PlatformTenantSummary[]
  trialingTenants: PlatformTenantSummary[]
  stripeConnectedCount: number
  totalMrrCents: number
}

export type PlatformAnalytics = {
  moduleTotals: TenantModuleCount[]
  totalRecords: number
  aggregateUsage: {
    openJobs: number
    pipelineCents: number
    unpaidCents: number
    openIssues: number
  }
  tenantGrowth: Array<{ month: string; count: number }>
  topTenantsByMembers: Array<{ id: string; name: string; memberCount: number }>
  topTenantsByRecords: Array<{ id: string; name: string; recordCount: number }>
}
