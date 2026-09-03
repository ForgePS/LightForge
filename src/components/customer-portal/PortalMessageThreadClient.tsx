'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'

type Message = {
  id: string
  body: string
  direction: 'inbound' | 'outbound'
  createdAt: string | null
}

export default function PortalMessageThreadClient({
  publicNumber,
  subject,
  messages: initial,
  error
}: {
  publicNumber: string
  subject: string
  messages: Message[]
  error?: string
}) {
  const [messages, setMessages] = useState(initial)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const reply = async () => {
    setLoading(true)
    setFormError(null)

    try {
      const res = await fetch(`/api/customer-portal/messages/${encodeURIComponent(publicNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to reply')
      setMessages(data.thread.messages)
      setBody('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to reply')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <PortalShell title='Messages'>
        <Alert severity='warning'>{error}</Alert>
      </PortalShell>
    )
  }

  return (
    <PortalShell title={subject} subtitle={publicNumber}>
      {formError && <Alert severity='error'>{formError}</Alert>}
      <Stack spacing={1.5}>
        {messages.map(message => (
          <Card
            key={message.id}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              alignSelf: message.direction === 'inbound' ? 'flex-end' : 'stretch',
              maxWidth: message.direction === 'inbound' ? '90%' : '100%',
              bgcolor: message.direction === 'inbound' ? 'action.hover' : 'background.paper'
            }}
          >
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant='body2' color='text.secondary'>
                {message.direction === 'inbound' ? 'You' : 'Company'}
                {message.createdAt ? ` · ${message.createdAt}` : ''}
              </Typography>
              <Typography whiteSpace='pre-wrap'>{message.body}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <CustomTextField
        fullWidth
        multiline
        minRows={3}
        label='Reply'
        value={body}
        onChange={e => setBody(e.target.value)}
      />
      <Button variant='contained' disabled={loading || body.trim().length < 2} onClick={reply}>
        {loading ? 'Sending…' : 'Send reply'}
      </Button>
      <Button href='/portal/messages' variant='text'>
        Back to messages
      </Button>
    </PortalShell>
  )
}
