import 'server-only'

import {
  CUSTOMER_PORTAL_SETTINGS_DOC,
  DEFAULT_PORTAL_FEATURE_SETTINGS,
  normalizePortalSettings,
  PORTAL_SESSION_COOKIE_DEFAULT
} from '@libs/customer-portal/settings-shared'

export {
  CUSTOMER_PORTAL_SETTINGS_DOC,
  DEFAULT_PORTAL_FEATURE_SETTINGS,
  normalizePortalSettings
}

export const PORTAL_SESSION_COOKIE = process.env.PORTAL_SESSION_COOKIE_NAME || PORTAL_SESSION_COOKIE_DEFAULT
