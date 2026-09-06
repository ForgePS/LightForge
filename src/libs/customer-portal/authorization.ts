export type PortalAuthContext = {
  customerId: string
  customerName: string
  propertyNames: string[]
}

export function belongsToPortalCustomer(
  record: Record<string, unknown>,
  ctx: PortalAuthContext,
  options?: { propertyField?: string; customerNameField?: string; customerIdField?: string }
) {
  const propertyField = options?.propertyField || 'propertyName'
  const customerNameField = options?.customerNameField || 'customerName'
  const customerIdField = options?.customerIdField || 'customerId'

  if (record[customerIdField] && String(record[customerIdField]) === ctx.customerId) {
    return true
  }

  if (record[customerNameField] && String(record[customerNameField]) === ctx.customerName) {
    return true
  }

  const prop = record[propertyField]

  return Boolean(prop && ctx.propertyNames.includes(String(prop)))
}
