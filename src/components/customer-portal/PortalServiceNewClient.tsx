'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'

const SAFETY =
  'Do not climb a ladder, access the roof, handle damaged electrical connections, or attempt repairs yourself. If there is smoke, fire, sparking, or an immediate electrical hazard, move to a safe location and call emergency services.'

export default function PortalServiceNewClient({
  problemTypes,
  problemLocations
}: {
  problemTypes: string[]
  problemLocations: string[]
}) {
  const router = useRouter()
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])
  const [problemType, setProblemType] = useState(problemTypes[0] || '')
  const [problemLocation, setProblemLocation] = useState(problemLocations[0] || '')
  const [description, setDescription] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('phone')
  const [availability, setAvailability] = useState('')
  const [accessIfAway, setAccessIfAway] = useState(false)
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const form = new FormData()

      form.append('file', file)
      const res = await fetch('/api/customer-portal/photos', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPhotoUrls(prev => [...prev, data.photo.url].slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/customer-portal/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemType,
          problemLocation,
          description,
          startedAt: startedAt || undefined,
          preferredContactMethod,
          availability: availability || undefined,
          accessIfAway,
          safetyAcknowledged,
          photoUrls,
          idempotencyKey
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to submit')
      router.replace(`/portal/service/${encodeURIComponent(data.request.publicNumber)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit')
      setLoading(false)
    }
  }

  return (
    <PortalShell title='Report a Lighting Issue'>
      <Alert severity='warning'>{SAFETY}</Alert>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2.5}>
            {error && <Alert severity='error'>{error}</Alert>}
            <CustomTextField
              select
              fullWidth
              label='Problem type'
              value={problemType}
              onChange={e => setProblemType(e.target.value)}
            >
              {problemTypes.map(item => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              select
              fullWidth
              label='Problem location'
              value={problemLocation}
              onChange={e => setProblemLocation(e.target.value)}
            >
              {problemLocations.map(item => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              fullWidth
              label='Describe the issue'
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              minRows={4}
            />
            <CustomTextField
              fullWidth
              label='When did it start?'
              type='date'
              value={startedAt}
              onChange={e => setStartedAt(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <CustomTextField
              select
              fullWidth
              label='Preferred contact method'
              value={preferredContactMethod}
              onChange={e => setPreferredContactMethod(e.target.value)}
            >
              <MenuItem value='phone'>Phone</MenuItem>
              <MenuItem value='email'>Email</MenuItem>
              <MenuItem value='text'>Text</MenuItem>
            </CustomTextField>
            <CustomTextField
              fullWidth
              label='Availability'
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              placeholder='Weekday mornings, etc.'
            />
            <FormControlLabel
              control={<Checkbox checked={accessIfAway} onChange={e => setAccessIfAway(e.target.checked)} />}
              label='You may access the property if nobody is home'
            />
            <Stack spacing={1}>
              <Typography variant='subtitle2'>Photos (optional)</Typography>
              <Button variant='outlined' component='label' disabled={uploading || photoUrls.length >= 5}>
                {uploading ? 'Uploading…' : 'Add photo'}
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  capture='environment'
                  onChange={e => {
                    const file = e.target.files?.[0]

                    if (file) void uploadPhoto(file)
                  }}
                />
              </Button>
              {photoUrls.length > 0 && (
                <Typography variant='body2' color='text.secondary'>
                  {photoUrls.length} photo{photoUrls.length === 1 ? '' : 's'} attached
                </Typography>
              )}
            </Stack>
            <FormControlLabel
              control={
                <Checkbox checked={safetyAcknowledged} onChange={e => setSafetyAcknowledged(e.target.checked)} />
              }
              label='I understand not to attempt repairs myself'
            />
            <Button
              variant='contained'
              size='large'
              disabled={loading || !safetyAcknowledged || description.trim().length < 5}
              onClick={submit}
            >
              {loading ? 'Submitting…' : 'Submit request'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PortalShell>
  )
}
