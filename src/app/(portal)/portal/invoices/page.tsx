import PortalInvoicesListClient from '@components/customer-portal/PortalInvoicesListClient'
import { listPortalInvoices } from '@libs/customer-portal/billing'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalInvoicesPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalInvoicesListClient
        invoices={[]}
        balanceCents={0}
        onlinePaymentsEnabled={false}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  try {
    const data = await listPortalInvoices(session)

    return (
      <PortalInvoicesListClient
        invoices={data.invoices}
        balanceCents={data.billingSummary.balanceCents}
        onlinePaymentsEnabled={data.onlinePaymentsEnabled}
      />
    )
  } catch {
    return (
      <PortalInvoicesListClient
        invoices={[]}
        balanceCents={0}
        onlinePaymentsEnabled={false}
        error='Unable to load invoices.'
      />
    )
  }
}
