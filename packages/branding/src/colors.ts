/** LightForge brand color tokens — source of truth for marketing and future shared use. */
export const colors = {
  primaryForest: '#1F5A32',
  lightforgeGreen: '#6FAF2D',
  forgeGold: '#D99A16',
  midnightNavy: '#10243A',
  charcoal: '#24282D',
  warmOffWhite: '#FAFAF7',
  white: '#FFFFFF'
} as const

export type BrandColor = keyof typeof colors

export const colorUsage = {
  green: ['accents', 'navigation', 'positive', 'feature-icons', 'workflow', 'selected'],
  gold: ['premium-accents', 'primary-ctas', 'logo-details', 'highlights'],
  midnightNavy: ['dark-sections', 'footer', 'field-app', 'nav-variants']
} as const
