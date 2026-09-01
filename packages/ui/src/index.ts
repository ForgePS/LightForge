/** Shared, framework-agnostic UI contracts. React/Vue wrappers live in each app. */
export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  disabled?: boolean
}

export type BadgeTone = 'green' | 'gold' | 'navy' | 'neutral'

export interface BadgeProps {
  tone?: BadgeTone
  label: string
}
