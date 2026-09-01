'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import type { SubscriptionPlan } from '@libs/firebase/types'
import { formatUsd } from '@libs/subscriptions/plans'

export default function PlansAdmin({ initialPlans }: { initialPlans: SubscriptionPlan[] }) {
  const router = useRouter()
  const [plans, setPlans] = useState(initialPlans)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const updatePlan = (index: number, patch: Partial<SubscriptionPlan>) => {
    setPlans(prev => prev.map((plan, i) => (i === index ? { ...plan, ...patch } : plan)))
  }

  const save = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/platform/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save plans')
      setMessage('Plans saved')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save plans')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      {(message || error) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}
      <Grid container spacing={3}>
        {plans.map((plan, index) => (
          <Grid key={plan.id} size={{ xs: 12, md: 6 }}>
            <Card className='h-full'>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='h6'>{plan.name}</Typography>
                    <Chip size='small' label={plan.id} variant='tonal' />
                  </Stack>
                  <Typography variant='body2' color='text.secondary'>
                    {plan.description || 'No description yet.'}
                  </Typography>
                  <Stack direction='row' spacing={1}>
                    <Chip size='small' label={`${formatUsd(plan.monthlyPriceCents)}/mo`} color='primary' variant='tonal' />
                    <Chip size='small' label={`${formatUsd(plan.yearlyPriceCents)}/yr`} variant='outlined' />
                    <Chip size='small' label={`${plan.includedSeats} seats`} variant='outlined' />
                  </Stack>
                  <Divider />
                  <CustomTextField
                    label='Name'
                    value={plan.name}
                    onChange={e => updatePlan(index, { name: e.target.value })}
                    fullWidth
                  />
                  <CustomTextField
                    label='Description'
                    value={plan.description}
                    onChange={e => updatePlan(index, { description: e.target.value })}
                    fullWidth
                  />
                  <CustomTextField
                    label='Monthly price (cents)'
                    type='number'
                    value={plan.monthlyPriceCents}
                    onChange={e => updatePlan(index, { monthlyPriceCents: Number(e.target.value) || 0 })}
                    helperText={formatUsd(plan.monthlyPriceCents)}
                    fullWidth
                  />
                  <CustomTextField
                    label='Yearly price (cents)'
                    type='number'
                    value={plan.yearlyPriceCents}
                    onChange={e => updatePlan(index, { yearlyPriceCents: Number(e.target.value) || 0 })}
                    helperText={formatUsd(plan.yearlyPriceCents)}
                    fullWidth
                  />
                  <CustomTextField
                    label='Included seats'
                    type='number'
                    value={plan.includedSeats}
                    onChange={e => updatePlan(index, { includedSeats: Number(e.target.value) || 0 })}
                    fullWidth
                  />
                  <CustomTextField
                    label='Features (one per line)'
                    value={plan.features.join('\n')}
                    onChange={e =>
                      updatePlan(index, {
                        features: e.target.value
                          .split('\n')
                          .map(line => line.trim())
                          .filter(Boolean)
                      })
                    }
                    multiline
                    minRows={4}
                    fullWidth
                  />
                  {plan.features.length > 0 && (
                    <>
                      <Typography variant='subtitle2'>Feature preview</Typography>
                      <List dense disablePadding>
                        {plan.features.slice(0, 4).map(feature => (
                          <ListItem key={feature} disableGutters>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <i className='tabler-check text-success' />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button variant='contained' onClick={save} disabled={loading} className='self-start'>
        {loading ? 'Saving…' : 'Save plans'}
      </Button>
    </Stack>
  )
}
