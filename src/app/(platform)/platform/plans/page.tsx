import Stack from '@mui/material/Stack'

import PlansAdmin from '@components/platform/PlansAdmin'
import { PlatformPageHeader } from '@components/platform/platformUi'
import { listSubscriptionPlans } from '@libs/platform/admin'

export default async function PlatformPlansPage() {
  const plans = await listSubscriptionPlans()

  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Plans & pricing'
        subtitle='Define the catalog used when provisioning tenants and assigning subscriptions.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Plans & pricing' }
        ]}
      />
      <PlansAdmin initialPlans={plans} />
    </Stack>
  )
}
