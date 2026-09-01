'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'

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
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant='h6'>{plan.id}</Typography>
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
