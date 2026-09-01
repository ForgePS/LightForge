export type CookieConsentCategory = 'essential' | 'analytics' | 'advertising'

export type CookieConsentState = {
  essential: true
  analytics: boolean
  advertising: boolean
  decidedAt?: string
}

const STORAGE_KEY = 'lf-cookie-consent'

export function useCookieConsent() {
  const config = useRuntimeConfig()
  const enabled = computed(() => Boolean(config.public.cookieConsentEnabled))

  const consent = useState<CookieConsentState | null>('cookie-consent', () => null)
  const showBanner = computed(() => enabled.value && !consent.value)

  function loadStoredConsent() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) consent.value = JSON.parse(raw) as CookieConsentState
    } catch {
      consent.value = null
    }
  }

  function persist(next: CookieConsentState) {
    consent.value = { ...next, decidedAt: new Date().toISOString() }
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent.value))
    }
  }

  function acceptEssentialOnly() {
    persist({ essential: true, analytics: false, advertising: false })
  }

  function acceptAllOptional() {
    persist({ essential: true, analytics: true, advertising: true })
  }

  function savePreferences(preferences: Pick<CookieConsentState, 'analytics' | 'advertising'>) {
    persist({ essential: true, ...preferences })
  }

  onMounted(loadStoredConsent)

  return {
    enabled,
    consent,
    showBanner,
    acceptEssentialOnly,
    acceptAllOptional,
    savePreferences
  }
}
