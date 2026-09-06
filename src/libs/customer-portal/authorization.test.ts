import { describe, expect, it } from 'vitest'

import { belongsToPortalCustomer } from '@libs/customer-portal/authorization'

const ctx = {
  customerId: 'cust_1',
  customerName: 'Anderson Residence',
  propertyNames: ['Anderson Main Home', 'Anderson Guest Cottage']
}

describe('belongsToPortalCustomer', () => {
  it('matches by customerId first', () => {
    expect(belongsToPortalCustomer({ customerId: 'cust_1', customerName: 'Other' }, ctx)).toBe(true)
  })

  it('matches by customer name or property name', () => {
    expect(belongsToPortalCustomer({ customerName: 'Anderson Residence' }, ctx)).toBe(true)
    expect(belongsToPortalCustomer({ propertyName: 'Anderson Guest Cottage' }, ctx)).toBe(true)
    expect(belongsToPortalCustomer({ customerName: 'Maple Grove HOA' }, ctx)).toBe(false)
    expect(belongsToPortalCustomer({ propertyName: 'Clubhouse' }, ctx)).toBe(false)
  })
})
