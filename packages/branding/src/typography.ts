/** LightForge typography scale (SaaS / Vuexy-inspired polish). */
export const fontFamilies = {
  sans: '"Public Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  display: '"Public Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
} as const

export const typeScale = {
  display: { size: '3.5rem', weight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' },
  h1: { size: '2.75rem', weight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
  h2: { size: '2.25rem', weight: 650, lineHeight: 1.25, letterSpacing: '-0.015em' },
  h3: { size: '1.75rem', weight: 600, lineHeight: 1.3 },
  h4: { size: '1.375rem', weight: 600, lineHeight: 1.35 },
  bodyLarge: { size: '1.125rem', weight: 400, lineHeight: 1.65 },
  body: { size: '1rem', weight: 400, lineHeight: 1.6 },
  bodySmall: { size: '0.875rem', weight: 400, lineHeight: 1.55 },
  label: { size: '0.8125rem', weight: 600, lineHeight: 1.4, letterSpacing: '0.02em' },
  caption: { size: '0.75rem', weight: 400, lineHeight: 1.4 },
  button: { size: '0.9375rem', weight: 600, lineHeight: 1.2, letterSpacing: '0.01em' },
  navigation: { size: '0.9375rem', weight: 500, lineHeight: 1.2 }
} as const
