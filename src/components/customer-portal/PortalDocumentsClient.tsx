'use client'

import { useState } from 'react'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'
import PortalVerificationPanel from '@components/customer-portal/PortalVerificationPanel'

type DocRow = {
  publicNumber: string
  title: string
  category: string
  status: string
  signatureStatus: string | null
  version: number
  createdAt: string | null
  signedAt: string | null
  downloadUrl: string | null
  requiresStepUp: boolean
}

export default function PortalDocumentsClient({
  documents,
  error
}: {
  documents: DocRow[]
  error?: string
}) {
  const [active, setActive] = useState<DocRow | null>(null)
  const [verified, setVerified] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const openDoc = async (doc: DocRow) => {
    setFormError(null)
    setMessage(null)
    setActive(doc)
    setVerified(!doc.requiresStepUp)

    if (!doc.requiresStepUp) return

    try {
      const res = await fetch(`/api/customer-portal/documents/${encodeURIComponent(doc.publicNumber)}`)
      const data = await res.json()

      if (res.status === 403 && data.code === 'STEP_UP_REQUIRED') {
        setVerified(false)
        return
      }

      if (!res.ok) throw new Error(data.error || 'Unable to open document')
      setActive(data.document)
      setVerified(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to open document')
    }
  }

  const sign = async () => {
    if (!active) return

    setLoading(true)
    setFormError(null)

    try {
      const res = await fetch(`/api/customer-portal/documents/${encodeURIComponent(active.publicNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, acceptedTerms })
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'STEP_UP_REQUIRED') {
        setVerified(false)
        setFormError('Verify with a one-time code before signing.')
        return
      }

      if (!res.ok) throw new Error(data.error || 'Unable to sign')
      setActive(data.document)
      setMessage('Document signed')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to sign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalShell title='Documents' subtitle='Agreements and customer-visible files'>
      {error && <Alert severity='warning'>{error}</Alert>}
      {!error && documents.length === 0 && <Alert severity='info'>No customer documents yet.</Alert>}

      <Stack spacing={2}>
        {documents.map(doc => (
          <Card
            key={doc.publicNumber}
            elevation={0}
            sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
            onClick={() => void openDoc(doc)}
          >
            <CardContent>
              <Stack spacing={1}>
                <Stack direction='row' justifyContent='space-between' gap={1}>
                  <Typography fontWeight={700}>{doc.title}</Typography>
                  <Chip size='small' label={doc.signatureStatus || doc.status} />
                </Stack>
                <Typography variant='body2' color='text.secondary'>
                  {doc.category} · {doc.publicNumber} · v{doc.version}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {active && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>{active.title}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {active.category} · {active.publicNumber}
              </Typography>
              {(formError || message) && (
                <Alert severity={formError ? 'error' : 'success'}>{formError || message}</Alert>
              )}
              {active.requiresStepUp && !verified && (
                <PortalVerificationPanel purpose='documents' onVerified={() => void openDoc(active)} />
              )}
              {verified && active.downloadUrl && (
                <Button component={Link} href={active.downloadUrl} target='_blank' variant='outlined'>
                  Download
                </Button>
              )}
              {verified && active.signatureStatus !== 'signed' && (
                <>
                  <CustomTextField
                    fullWidth
                    label='Signer full name'
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />}
                    label='I agree to sign this document electronically'
                  />
                  <Button
                    variant='contained'
                    disabled={loading || !acceptedTerms || signerName.trim().length < 2}
                    onClick={sign}
                  >
                    {loading ? 'Signing…' : 'Sign document'}
                  </Button>
                </>
              )}
              {active.signedAt && (
                <Alert severity='success'>Signed {active.signedAt}</Alert>
              )}
              <Button variant='text' onClick={() => setActive(null)}>
                Close
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </PortalShell>
  )
}
