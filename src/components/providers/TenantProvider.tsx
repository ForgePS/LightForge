'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { ActiveTenantInfo, SessionUser } from '@libs/firebase/types'

export type TenantContextValue = {
  user: SessionUser
  tenant: ActiveTenantInfo | null
  tenants: ActiveTenantInfo[]
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({
  value,
  children
}: {
  value: TenantContextValue
  children: ReactNode
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)

  if (!ctx) {
    throw new Error('useTenant must be used within TenantProvider')
  }

  return ctx
}

export function useOptionalTenant() {
  return useContext(TenantContext)
}
