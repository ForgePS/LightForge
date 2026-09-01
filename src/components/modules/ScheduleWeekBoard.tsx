'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

import ModulePageClient from '@components/modules/ModulePageClient'
import { getModule } from '@libs/modules/registry'

type ScheduleEvent = Record<string, unknown> & { id: string }

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day

  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)

  return d
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const d = new Date(date)

  d.setDate(d.getDate() + days)

  return d
}

export default function ScheduleWeekBoard({ initialRecords }: { initialRecords: ScheduleEvent[] }) {
  const router = useRouter()
  const module = getModule('scheduleEvents')!
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [showTable, setShowTable] = useState(false)

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const byDay = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {}

    for (const day of days) {
      map[toDateKey(day)] = []
    }

    for (const event of initialRecords) {
      const key = String(event.date || '')

      if (!map[key]) continue
      map[key].push(event)
    }

    return map
  }, [days, initialRecords])

  const label = `${toDateKey(days[0]!)} → ${toDateKey(days[6]!)}`

  return (
    <Stack spacing={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={2}>
        <div>
          <Typography variant='h4'>Schedule</Typography>
          <Typography color='text.secondary'>Week board for crew assignments</Typography>
        </div>
        <Stack direction='row' spacing={1} flexWrap='wrap'>
          <Button
            variant='outlined'
            onClick={() => {
              setWeekStart(startOfWeek(addDays(weekStart, -7)))
              router.refresh()
            }}
          >
            Previous week
          </Button>
          <Button variant='outlined' onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This week
          </Button>
          <Button
            variant='outlined'
            onClick={() => {
              setWeekStart(startOfWeek(addDays(weekStart, 7)))
              router.refresh()
            }}
          >
            Next week
          </Button>
          <Button variant='text' onClick={() => setShowTable(v => !v)}>
            {showTable ? 'Hide list' : 'Show list editor'}
          </Button>
        </Stack>
      </Stack>

      <Typography variant='body2' color='text.secondary'>
        {label}
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ overflowX: 'auto' }}
      >
        {days.map(day => {
          const key = toDateKey(day)
          const events = byDay[key] || []

          return (
            <Card key={key} sx={{ minWidth: { xs: '100%', md: 160 }, flex: 1, minHeight: 220 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <div>
                    <Typography variant='subtitle2'>
                      {day.toLocaleDateString(undefined, { weekday: 'short' })}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {key}
                    </Typography>
                  </div>
                  <Divider />
                  {events.length === 0 && (
                    <Typography variant='caption' color='text.secondary'>
                      No events
                    </Typography>
                  )}
                  {events.map(event => (
                    <Stack key={event.id} spacing={0.5} className='border rounded p-2'>
                      <Typography variant='body2' className='font-medium'>
                        {String(event.title || 'Event')}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {String(event.startTime || '—')} · {String(event.crew || 'Unassigned')}
                      </Typography>
                      {event.jobTitle ? <Chip size='small' label={String(event.jobTitle)} /> : null}
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>

      {showTable && <ModulePageClient module={module} initialRecords={initialRecords} />}
    </Stack>
  )
}
