import { moduleKeyForPath } from '@libs/modules/moduleAccess'

type FilterableMenuItem = {
  href?: string
  children?: FilterableMenuItem[]
  [key: string]: unknown
}

export function filterMenuByEnabledModules<T extends FilterableMenuItem>(
  menuData: T[],
  enabledModules: string[] | undefined
): T[] {
  if (!enabledModules) return menuData

  const enabled = new Set(enabledModules)

  return menuData
    .map(item => {
      if (item.children?.length) {
        const children = item.children.filter(child => {
          if (!child.href) return true
          const moduleKey = moduleKeyForPath(child.href)

          return !moduleKey || enabled.has(moduleKey)
        }) as T[]

        if (children.length === 0) return null

        return { ...item, children } as T
      }

      if (!item.href) return item

      const moduleKey = moduleKeyForPath(item.href)

      if (moduleKey && !enabled.has(moduleKey)) return null

      return item
    })
    .filter(Boolean) as T[]
}
