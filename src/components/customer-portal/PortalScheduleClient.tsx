'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

import PortalShell from '@components/customer-portal/PortalShell'

type SchedulePayload = {
  address: string | null
  appointments: Array<{
    id: string
    type: string
    title: string
    date: string | null
    arrivalWindow: string | null
    address: string | null
    status: string
    preparationInstructions: string | null
    weatherNotice: string | null
    technicianEnRoute?: boolean
    crewFirstName?: string | null
  }>
  timeline: Array<{ key: string; label: string; at: string | null; complete: boolean; current: boolean }>
  technicianArrivalEnabled?: boolean
}

export default function PortalScheduleClient({
  schedule,
  error
}: {
  schedule: SchedulePayload | null
  error?: string
}) {
  if (error || !schedule) {
    return (
      <PortalShell title='Schedule'>
        <Alert severity='warning'>{error || 'Unable to load schedule'}</Alert>
      </PortalShell>
    )
  }

  const activeStep = Math.max(
    0,
    schedule.timeline.findIndex(item => item.current)
  )

  return (
    <PortalShell title='Schedule' subtitle={schedule.address || undefined}>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant='h6' className='mbe-2'>
            Season timeline
          </Typography>
          <Stepper activeStep={activeStep} orientation='vertical'>
            {schedule.timeline.map(item => (
              <Step key={item.key} completed={item.complete}>
                <StepLabel optional={item.at ? <Typography variant='caption'>{item.at}</Typography> : undefined}>
                  {item.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Typography variant='h6'>Appointments</Typography>
      {schedule.appointments.length === 0 ? (
        <Alert severity='info'>No upcoming appointments yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {schedule.appointments.map(appt => (
            <Card key={appt.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction='row' justifyContent='space-between' gap={1}>
                    <Typography fontWeight={700}>{appt.type}</Typography>
                    <Chip size='small' label={appt.status} />
                  </Stack>
                  <Typography>{appt.title}</Typography>
                  {appt.date && <Typography color='text.secondary'>Date: {appt.date}</Typography>}
                  {appt.arrivalWindow && (
                    <Typography color='text.secondary'>Window: {appt.arrivalWindow}</Typography>
                  )}
                  {appt.address && <Typography color='text.secondary'>{appt.address}</Typography>}
                  {appt.technicianEnRoute && (
                    <Alert severity='success'>
                      {appt.crewFirstName
                        ? `${appt.crewFirstName} is on the way`
                        : 'Your technician is on the way'}
                    </Alert>
                  )}
                  {appt.preparationInstructions && (
                    <Alert severity='info'>{appt.preparationInstructions}</Alert>
                  )}
                  {appt.weatherNotice && <Alert severity='warning'>{appt.weatherNotice}</Alert>}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PortalShell>
  )
}
