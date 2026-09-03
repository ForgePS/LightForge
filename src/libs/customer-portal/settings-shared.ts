import type { CustomerPortalFeatureSettings } from '@libs/customer-portal/types'

export const CUSTOMER_PORTAL_SETTINGS_DOC = 'customerPortal'
export const PORTAL_SESSION_COOKIE_DEFAULT = '__lf_portal_session'

export const DEFAULT_PORTAL_FEATURE_SETTINGS: CustomerPortalFeatureSettings = {
  enabled: false,
  myLighting: true,
  photos: true,
  schedule: true,
  serviceRequests: true,
  proposals: true,
  onlinePayments: false,
  agreements: true,
  messages: true,
  propertyInformation: true,
  seasonalRenewal: true,
  referrals: false,
  reviews: false,
  addOnRequests: false,
  savedPaymentMethods: false,
  autopay: false,
  multipleProperties: true,
  customerFileUploads: true,
  technicianArrivalStatus: false,
  showPoweredBy: true,
  portalDisplayName: null,
  welcomeMessage: null,
  supportPhone: null,
  supportEmail: null,
  website: null,
  footerText: null,
  termsUrl: null,
  privacyUrl: null,
  renewalLabel: 'Renew Service',
  removalLabel: 'Removal',
  sessionIdleMinutes: 60 * 24,
  sessionAbsoluteHours: 24 * 14,
  forceVerificationForInvoices: true,
  forceVerificationForDocuments: true
}

export function normalizePortalSettings(value: unknown): CustomerPortalFeatureSettings {
  const data = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    ...DEFAULT_PORTAL_FEATURE_SETTINGS,
    enabled: Boolean(data.enabled ?? DEFAULT_PORTAL_FEATURE_SETTINGS.enabled),
    myLighting: Boolean(data.myLighting ?? true),
    photos: Boolean(data.photos ?? true),
    schedule: Boolean(data.schedule ?? true),
    serviceRequests: Boolean(data.serviceRequests ?? true),
    proposals: Boolean(data.proposals ?? true),
    onlinePayments: Boolean(data.onlinePayments ?? false),
    agreements: Boolean(data.agreements ?? true),
    messages: Boolean(data.messages ?? true),
    propertyInformation: Boolean(data.propertyInformation ?? true),
    seasonalRenewal: Boolean(data.seasonalRenewal ?? true),
    referrals: Boolean(data.referrals ?? false),
    reviews: Boolean(data.reviews ?? false),
    addOnRequests: Boolean(data.addOnRequests ?? false),
    savedPaymentMethods: Boolean(data.savedPaymentMethods ?? false),
    autopay: Boolean(data.autopay ?? false),
    multipleProperties: Boolean(data.multipleProperties ?? true),
    customerFileUploads: Boolean(data.customerFileUploads ?? true),
    technicianArrivalStatus: Boolean(data.technicianArrivalStatus ?? false),
    showPoweredBy: data.showPoweredBy !== false,
    portalDisplayName: typeof data.portalDisplayName === 'string' ? data.portalDisplayName : null,
    welcomeMessage: typeof data.welcomeMessage === 'string' ? data.welcomeMessage : null,
    supportPhone: typeof data.supportPhone === 'string' ? data.supportPhone : null,
    supportEmail: typeof data.supportEmail === 'string' ? data.supportEmail : null,
    website: typeof data.website === 'string' ? data.website : null,
    footerText: typeof data.footerText === 'string' ? data.footerText : null,
    termsUrl: typeof data.termsUrl === 'string' ? data.termsUrl : null,
    privacyUrl: typeof data.privacyUrl === 'string' ? data.privacyUrl : null,
    renewalLabel: typeof data.renewalLabel === 'string' ? data.renewalLabel : 'Renew Service',
    removalLabel: typeof data.removalLabel === 'string' ? data.removalLabel : 'Removal',
    sessionIdleMinutes: Number(data.sessionIdleMinutes || DEFAULT_PORTAL_FEATURE_SETTINGS.sessionIdleMinutes),
    sessionAbsoluteHours: Number(data.sessionAbsoluteHours || DEFAULT_PORTAL_FEATURE_SETTINGS.sessionAbsoluteHours),
    forceVerificationForInvoices: data.forceVerificationForInvoices !== false,
    forceVerificationForDocuments: data.forceVerificationForDocuments !== false
  }
}
