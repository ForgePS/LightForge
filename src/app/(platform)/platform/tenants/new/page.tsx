import Stack from '@mui/material/Stack'

import NewTenantForm from '@components/platform/NewTenantForm'
import { PlatformPageHeader } from '@components/platform/platformUi'

export default function NewTenantPage() {
  return (
    <Stack spacing={4} className='max-is-[840px]'>
      <PlatformPageHeader
        title='New tenant'
        subtitle='Provision a workspace, assign an initial status, and optionally create an owner login.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Tenants', href: '/platform/tenants' },
          { label: 'New tenant' }
        ]}
      />
      <NewTenantForm />
    </Stack>
  )
}
