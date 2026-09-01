import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import PlansAdmin from '@components/platform/PlansAdmin'
import { listSubscriptionPlans } from '@libs/platform/admin'

export default async function PlatformPlansPage() {
  const plans = await listSubscriptionPlans()

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant='h4'>Plans & pricing</Typography>
        <Typography color='text.secondary'>
          Catalog used when assigning subscriptions. Stripe IDs can be stored per tenant until billing is wired.
        </Typography>
      </div>
      <PlansAdmin initialPlans={plans} />
    </Stack>
  )
}
