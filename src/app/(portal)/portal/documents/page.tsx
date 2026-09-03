import PortalDocumentsClient from '@components/customer-portal/PortalDocumentsClient'
import { listPortalDocuments } from '@libs/customer-portal/documents'
import { getPortalSessionFromCookie } from '@libs/customer-portal/session'

export default async function PortalDocumentsPage() {
  const session = await getPortalSessionFromCookie()

  if (!session) {
    return (
      <PortalDocumentsClient
        documents={[]}
        error='Your portal session has expired. Open your secure link again.'
      />
    )
  }

  try {
    const data = await listPortalDocuments(session)

    return <PortalDocumentsClient documents={data.documents} />
  } catch (error) {
    return (
      <PortalDocumentsClient
        documents={[]}
        error={error instanceof Error ? error.message : 'Unable to load documents.'}
      />
    )
  }
}
