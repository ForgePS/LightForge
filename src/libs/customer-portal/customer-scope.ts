import type { DocumentData } from 'firebase-admin/firestore'

type QueryLike = {
  where: (
    field: string,
    op: '==',
    value: string
  ) => {
    limit: (n: number) => {
      get: () => Promise<{ docs: Array<{ id: string; data: () => DocumentData }> }>
    }
  }
}

/**
 * Load customer-scoped docs preferring customerId, merging legacy name matches
 * that do not belong to a different customerId.
 */
export async function loadCustomerScopedDocs(
  collection: QueryLike,
  input: { customerId: string; customerName: string; limit?: number }
): Promise<Array<DocumentData & { id: string }>> {
  const limit = input.limit || 50
  const byId = await collection
    .where('customerId', '==', input.customerId)
    .limit(limit)
    .get()
    .catch(() => null)

  const byName = input.customerName
    ? await collection
        .where('customerName', '==', input.customerName)
        .limit(limit)
        .get()
        .catch(() => null)
    : null

  const map = new Map<string, DocumentData & { id: string }>()

  for (const doc of byId?.docs || []) {
    map.set(doc.id, { id: doc.id, ...doc.data() })
  }

  for (const doc of byName?.docs || []) {
    if (map.has(doc.id)) continue
    const data = doc.data()

    if (data.customerId && String(data.customerId) !== input.customerId) continue

    map.set(doc.id, { id: doc.id, ...data })
  }

  return [...map.values()]
}
