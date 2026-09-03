'use client'

import { useState } from 'react'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'

type Thread = {
  publicNumber: string
  subject: string
  updatedAt: string | null
  unread: boolean
  preview: string | null
}

export default function PortalMessagesClient({
  threads: initial,
  error
}: {
  threads: Thread[]
  error?: string
}) {
  const [threads] = useState(initial)
  const [subject, setSubject] = useState('Question for the team')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const create = async () => {
    setLoading(true)
    setFormError(null)

    try {
      const res = await fetch('/api/customer-portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to send')
      window.location.href = `/portal/messages/${encodeURIComponent(data.publicNumber)}`
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to send')
      setLoading(false)
    }
  }

  return (
    <PortalShell title='Messages' subtitle='Simple conversation with your lighting company'>
      {error && <Alert severity='warning'>{error}</Alert>}
      {formError && <Alert severity='error'>{formError}</Alert>}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>New message</Typography>
            <CustomTextField fullWidth label='Subject' value={subject} onChange={e => setSubject(e.target.value)} />
            <CustomTextField
              fullWidth
              multiline
              minRows={3}
              label='Message'
              value={body}
              onChange={e => setBody(e.target.value)}
            />
            <Button variant='contained' disabled={loading || body.trim().length < 2} onClick={create}>
              {loading ? 'Sending…' : 'Send message'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {threads.map(thread => (
          <Card
            key={thread.publicNumber}
            component={Link}
            href={`/portal/messages/${encodeURIComponent(thread.publicNumber)}`}
            elevation={0}
            sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', textDecoration: 'none', color: 'inherit' }}
          >
            <CardContent>
              <Stack spacing={0.5}>
                <Stack direction='row' justifyContent='space-between' gap={1}>
                  <Typography fontWeight={700}>{thread.subject}</Typography>
                  {thread.unread && <Chip size='small' color='warning' label='Unread' />}
                </Stack>
                {thread.preview && (
                  <Typography variant='body2' color='text.secondary' noWrap>
                    {thread.preview}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PortalShell>
  )
}
