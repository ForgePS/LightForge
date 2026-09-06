export type PortalAuthContext = {
  customerId: string
  customerName: string
  propertyNames: string[]
}

/**
 * Prefer stable IDs. If a record already has customerId, name/property matching must not override it.
 * Name/property fallback is only for legacy rows that predate dual-write.
 */
export function belongsToPortalCustomer(
  record: Record<string, unknown>,
  ctx: PortalAuthContext,
  options?: { propertyField?: string; customerNameField?: string; customerIdField?: string }
) {
  const propertyField = options?.propertyField || 'propertyName'
  const customerNameField = options?.customerNameField || 'customerName'
  const customerIdField = options?.customerIdField || 'customerId'

  if (record[customerIdField]) {
    return String(record[customerIdField]) === ctx.customerId
  }

  if (record[customerNameField] && String(record[customerNameField]) === ctx.customerName) {
    return true
  }

  const prop = record[propertyField]

  return Boolean(prop && ctx.propertyNames.includes(String(prop)))
}
