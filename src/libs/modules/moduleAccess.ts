import { MODULES } from '@libs/modules/registry'

export function getAllModuleKeys() {
  return MODULES.map(module => module.key)
}

export function isModuleKey(value: string) {
  return MODULES.some(module => module.key === value)
}

export function moduleKeyForPath(path: string) {
  const normalized = path.replace(/^\//, '')
  const module = MODULES.find(item => item.key === normalized || item.href.replace(/^\//, '') === normalized)

  return module?.key ?? null
}

export function isModuleEnabledForTenant(enabledModules: string[] | undefined, moduleKey: string) {
  if (!enabledModules) return true

  return enabledModules.includes(moduleKey)
}
