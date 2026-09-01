'use client'

import { useRouter } from 'next/navigation'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import type { SelectChangeEvent } from '@mui/material/Select'

import { useTenant } from '@components/providers/TenantProvider'
import ConvertTenantDialog from '@components/tenants/ConvertTenantDialog'

const statusColor = (status: string) => {
  if (status === 'trial') return 'warning'
  if (status === 'active') return 'success'

  return 'default'
}

const TenantSwitcher = () => {
  const router = useRouter()
  const { tenant, tenants } = useTenant()

  const handleSwitch = async (event: SelectChangeEvent) => {
    const tenantId = event.target.value

    if (!tenantId || tenantId === tenant?.id) return

    const res = await fetch('/api/tenants/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId })
    })

    if (res.ok) {
      router.refresh()
    }
  }

  if (!tenant) {
    return (
      <Typography variant='body2' color='text.secondary'>
        No active tenant
      </Typography>
    )
  }

  return (
    <Stack direction='row' spacing={2} alignItems='center' className='max-sm:hidden'>
      {tenants.length > 1 ? (
        <FormControl size='small' sx={{ minWidth: 180 }}>
          <Select value={tenant.id} onChange={handleSwitch} displayEmpty>
            {tenants.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Typography variant='body2' className='font-medium'>
          {tenant.name}
        </Typography>
      )}
      <Chip size='small' label={tenant.status} color={statusColor(tenant.status)} />
      {tenant.status === 'trial' && (tenant.role === 'owner' || tenant.role === 'admin') && (
        <ConvertTenantDialog defaultName={tenant.name} />
      )}
    </Stack>
  )
}

export default TenantSwitcher
