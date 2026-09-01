import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import NewTenantForm from '@components/platform/NewTenantForm'

export default function NewTenantPage() {
  return (
    <Stack spacing={3} className='max-is-[720px]'>
      <div>
        <Typography variant='h4'>New tenant</Typography>
        <Typography color='text.secondary'>Provision a workspace and optional owner login</Typography>
      </div>
      <NewTenantForm />
    </Stack>
  )
}
