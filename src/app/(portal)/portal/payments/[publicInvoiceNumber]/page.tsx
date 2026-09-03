import PortalPaymentReturnClient from '@components/customer-portal/PortalPaymentReturnClient'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'
import PortalShell from '@components/customer-portal/PortalShell'
import Alert from '@mui/material/Alert'

type Props = {
  params: Promise<{ publicInvoiceNumber: string }>
  searchParams: Promise<{ status?: string; session_id?: string }>
}

export default async function PortalPaymentReturnPage({ params, searchParams }: Props) {
  const { publicInvoiceNumber } = await params
  const query = await searchParams
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalShell title='Payment'>
        <Alert severity='warning'>Your portal session has expired. Open your secure link again.</Alert>
      </PortalShell>
    )
  }

  return (
    <PortalPaymentReturnClient
      invoiceNumber={publicInvoiceNumber}
      status={query.status || null}
      sessionId={query.session_id || null}
    />
  )
}
