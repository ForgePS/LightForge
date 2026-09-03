import PortalInvoiceDetailClient from '@components/customer-portal/PortalInvoiceDetailClient'
import { getPortalInvoice } from '@libs/customer-portal/billing'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

type Props = { params: Promise<{ publicInvoiceNumber: string }> }

export default async function PortalInvoiceDetailPage({ params }: Props) {
  const { publicInvoiceNumber } = await params
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalInvoiceDetailClient
        initial={null}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  try {
    const invoice = await getPortalInvoice(session, publicInvoiceNumber)

    return <PortalInvoiceDetailClient initial={invoice} />
  } catch {
    return <PortalInvoiceDetailClient initial={null} error='Invoice not found.' />
  }
}
