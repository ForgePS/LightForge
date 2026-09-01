import { getBillingOverview } from '@libs/platform/admin'
import PlatformBillingClient from '@components/platform/PlatformBillingClient'

export default async function PlatformBillingPage() {
  const billing = await getBillingOverview()

  return <PlatformBillingClient billing={billing} />
}
