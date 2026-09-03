'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'
import PortalVerificationPanel from '@components/customer-portal/PortalVerificationPanel'

type Renewal = {
  seasonLabel: string
  renewalLabel: string
  priorPackage: Array<{ serviceArea: string; items: Array<{ name: string }> }>
  existingRequest: { status: string; keepSameDesign: boolean; notes: string | null } | null
}

export default function PortalRenewalClient({
  renewal,
  error
}: {
  renewal: Renewal | null
  error?: string
}) {
  const [keepSameDesign, setKeepSameDesign] = useState(true)
  const [changeRequest, setChangeRequest] = useState('')
  const [preferredPeriod, setPreferredPeriod] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [verified, setVerified] = useState(false)
  const [needsStepUp, setNeedsStepUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [addonArea, setAddonArea] = useState('Roofline')
  const [addonDescription, setAddonDescription] = useState('')

  if (error || !renewal) {
    return (
      <PortalShell title='Renewal'>
        <Alert severity='warning'>{error || 'Renewal is not available'}</Alert>
      </PortalShell>
    )
  }

  const submit = async () => {
    setLoading(true)
    setFormError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/customer-portal/renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keepSameDesign,
          changeRequest: keepSameDesign ? undefined : changeRequest,
          preferredPeriod: preferredPeriod || undefined,
          acceptTerms,
          signerName: signerName || undefined
        })
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'STEP_UP_REQUIRED') {
        setNeedsStepUp(true)
        setFormError('Verify with a one-time code before signing renewal terms.')
        return
      }

      if (!res.ok) throw new Error(data.error || 'Unable to submit')
      setMessage('Renewal request submitted. The office will follow up.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit')
    } finally {
      setLoading(false)
    }
  }

  const submitAddon = async () => {
    setLoading(true)
    setFormError(null)

    try {
      const res = await fetch('/api/customer-portal/renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addon',
          serviceArea: addonArea,
          description: addonDescription
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to submit add-on')
      setMessage('Add-on request sent for office review. Scope and pricing are not changed automatically.')
      setAddonDescription('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit add-on')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalShell title={renewal.renewalLabel} subtitle={renewal.seasonLabel}>
      {(formError || message) && <Alert severity={formError ? 'error' : 'success'}>{formError || message}</Alert>}

      {renewal.existingRequest && (
        <Alert severity='info'>
          Existing request status: {renewal.existingRequest.status}
          {renewal.existingRequest.notes ? ` — ${renewal.existingRequest.notes}` : ''}
        </Alert>
      )}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant='h6' className='mbe-2'>
            Last season package
          </Typography>
          {renewal.priorPackage.length === 0 ? (
            <Typography color='text.secondary'>No customer-visible package on file yet.</Typography>
          ) : (
            <Stack spacing={1}>
              {renewal.priorPackage.map(group => (
                <Stack key={group.serviceArea}>
                  <Typography fontWeight={700}>{group.serviceArea}</Typography>
                  {group.items.map(item => (
                    <Typography key={item.name} variant='body2' color='text.secondary'>
                      {item.name}
                    </Typography>
                  ))}
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox checked={keepSameDesign} onChange={e => setKeepSameDesign(e.target.checked)} />
              }
              label='Keep the same design'
            />
            {!keepSameDesign && (
              <CustomTextField
                fullWidth
                multiline
                minRows={3}
                label='What should change?'
                value={changeRequest}
                onChange={e => setChangeRequest(e.target.value)}
              />
            )}
            <CustomTextField
              fullWidth
              label='Preferred install period'
              placeholder='Early November'
              value={preferredPeriod}
              onChange={e => setPreferredPeriod(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Signer name (optional for signed renewal)'
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
            />
            {(needsStepUp || (signerName && !verified)) && (
              <PortalVerificationPanel
                purpose='signature'
                onVerified={() => {
                  setVerified(true)
                  setNeedsStepUp(false)
                }}
              />
            )}
            <FormControlLabel
              control={<Checkbox checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />}
              label='I request renewal for next season under current pricing and terms pending office confirmation'
            />
            <Button variant='contained' disabled={loading || !acceptTerms} onClick={submit}>
              {loading ? 'Submitting…' : renewal.renewalLabel}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>Request an addition</Typography>
            <Typography variant='body2' color='text.secondary'>
              Creates an upsell request for office review. It does not change signed scope or invoices.
            </Typography>
            <CustomTextField
              fullWidth
              label='Service area'
              value={addonArea}
              onChange={e => setAddonArea(e.target.value)}
            />
            <CustomTextField
              fullWidth
              multiline
              minRows={3}
              label='Description'
              value={addonDescription}
              onChange={e => setAddonDescription(e.target.value)}
            />
            <Button
              variant='outlined'
              disabled={loading || addonDescription.trim().length < 5}
              onClick={submitAddon}
            >
              Submit add-on request
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PortalShell>
  )
}
