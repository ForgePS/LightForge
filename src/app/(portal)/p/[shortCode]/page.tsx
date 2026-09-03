import PortalExchangeClient from '@components/customer-portal/PortalExchangeClient'
import { getPortalSessionFromCookie, resolveShortCode } from '@libs/customer-portal/session'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ shortCode: string }>
  searchParams: Promise<{ g?: string }>
}

export default async function PortalEntryPage({ params, searchParams }: Props) {
  const { shortCode } = await params
  const { g: grantToken } = await searchParams
  const index = await resolveShortCode(shortCode)

  if (!index) {
    return (
      <PortalExchangeClient
        mode='error'
        shortCode={shortCode}
        message='This portal link is invalid or no longer available. Contact your lighting company for a new link.'
      />
    )
  }

  const session = await getPortalSessionFromCookie()

  if (session && session.portal.shortCode.toUpperCase() === shortCode.toUpperCase()) {
    redirect('/portal/home')
  }

  if (!grantToken) {
    return (
      <PortalExchangeClient
        mode='error'
        shortCode={shortCode}
        message='Open the full secure link or QR code from your lighting company to continue. The short address alone is not enough to sign in.'
      />
    )
  }

  return <PortalExchangeClient mode='exchange' shortCode={shortCode} grantToken={grantToken} />
}
