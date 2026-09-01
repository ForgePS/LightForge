export type TenantStatus = 'trial' | 'active' | 'suspended'
export type MemberRole = 'owner' | 'admin' | 'member'

export const TEMPLATE_ID = 'lightforge-demo'
export const DEMO_TENANT_SLUG = 'lightforge-demo'
export const YULETIDE_TENANT_SLUG = 'yuletide-lighting-co'

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
