'use client'

import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

import CustomTextField from '@core/components/mui/TextField'
import PortalShell from '@components/customer-portal/PortalShell'
import PortalVerificationPanel from '@components/customer-portal/PortalVerificationPanel'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

type ProposalDetail = {
  publicNumber: string
  title: string
  customerStatus: string
  amountCents: number
  depositCents: number | null
  taxCents: number
  totalCents: number
  version: number
  summary: string | null
  terms: string | null
  propertyName: string | null
  lineItems: Array<{
    id: string
    name: string
    serviceArea: string
    description: string | null
    amountCents: number
    optional: boolean
    selected: boolean
  }>
  canAccept: boolean
  canDecline: boolean
  canRequestChanges: boolean
  canSign: boolean
  signature: { signedAt: string | null; signerName: string | null } | null
}

export default function PortalProposalDetailClient({
  initial,
  error
}: {
  initial: ProposalDetail | null
  error?: string
}) {
  const [proposal, setProposal] = useState(initial)
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<string[]>(
    () => initial?.lineItems.filter(item => item.optional && item.selected).map(item => item.id) || []
  )
  const [changeMessage, setChangeMessage] = useState('')
  const [signerName, setSignerName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [needsStepUp, setNeedsStepUp] = useState(false)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, ProposalDetail['lineItems']>()

    for (const item of proposal?.lineItems || []) {
      const list = map.get(item.serviceArea) || []

      list.push(item)
      map.set(item.serviceArea, list)
    }

    return [...map.entries()]
  }, [proposal])

  if (error || !proposal) {
    return (
      <PortalShell title='Proposal'>
        <Alert severity='warning'>{error || 'Proposal not found'}</Alert>
        <Button href='/portal/proposals' variant='outlined'>
          Back to proposals
        </Button>
      </PortalShell>
    )
  }

  const run = async (action: string, body: Record<string, unknown> = {}) => {
    setLoading(true)
    setFormError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/customer-portal/proposals/${encodeURIComponent(proposal.publicNumber)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body })
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'STEP_UP_REQUIRED') {
        setNeedsStepUp(true)
        setFormError('Verify with a one-time code before signing.')
        return
      }

      if (!res.ok) throw new Error(data.error || 'Request failed')
      setProposal(data.proposal)
      setMessage(
        action === 'decline'
          ? 'Proposal declined'
          : action === 'change-request'
            ? 'Change request sent'
            : 'Proposal accepted and signed'
      )
      setNeedsStepUp(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalShell title={proposal.publicNumber} subtitle={proposal.title}>
      <Chip label={proposal.customerStatus} color='primary' sx={{ alignSelf: 'flex-start' }} />
      {proposal.propertyName && <Typography color='text.secondary'>{proposal.propertyName}</Typography>}
      {proposal.summary && <Typography>{proposal.summary}</Typography>}

      {(formError || message) && <Alert severity={formError ? 'error' : 'success'}>{formError || message}</Alert>}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>Package details</Typography>
            {grouped.map(([area, items]) => (
              <Stack key={area} spacing={1}>
                <Typography fontWeight={700}>{area}</Typography>
                {items.map(item => (
                  <Stack key={item.id} spacing={0.5}>
                    <Stack direction='row' justifyContent='space-between' gap={1}>
                      <Typography>
                        {item.name}
                        {item.optional ? ' (optional)' : ''}
                      </Typography>
                      <Typography>{money(item.amountCents)}</Typography>
                    </Stack>
                    {item.description && (
                      <Typography variant='body2' color='text.secondary'>
                        {item.description}
                      </Typography>
                    )}
                    {item.optional && proposal.canAccept && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedOptionalIds.includes(item.id)}
                            onChange={e =>
                              setSelectedOptionalIds(prev =>
                                e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                              )
                            }
                          />
                        }
                        label='Include this option'
                      />
                    )}
                  </Stack>
                ))}
                <Divider />
              </Stack>
            ))}
            <Typography>Subtotal: {money(proposal.amountCents)}</Typography>
            {proposal.taxCents > 0 && <Typography>Tax: {money(proposal.taxCents)}</Typography>}
            <Typography fontWeight={700}>Total: {money(proposal.totalCents)}</Typography>
            {proposal.depositCents != null && (
              <Typography color='text.secondary'>Deposit due after acceptance: {money(proposal.depositCents)}</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {proposal.terms && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant='h6' className='mbe-1'>
              Terms
            </Typography>
            <Typography variant='body2' color='text.secondary' whiteSpace='pre-wrap'>
              {proposal.terms}
            </Typography>
          </CardContent>
        </Card>
      )}

      {proposal.signature?.signedAt && (
        <Alert severity='success'>
          Signed by {proposal.signature.signerName || 'customer'} on {proposal.signature.signedAt}
        </Alert>
      )}

      {proposal.canRequestChanges && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Request changes</Typography>
              <CustomTextField
                fullWidth
                multiline
                minRows={3}
                label='What would you like changed?'
                value={changeMessage}
                onChange={e => setChangeMessage(e.target.value)}
              />
              <Button
                variant='outlined'
                disabled={loading || changeMessage.trim().length < 5}
                onClick={() => run('change-request', { message: changeMessage })}
              >
                Submit change request
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {(proposal.canAccept || proposal.canSign) && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6'>Accept & sign</Typography>
              <Typography variant='body2' color='text.secondary'>
                Electronic signature requires Level 3 verification. This implementation is not certified as legally
                sufficient for every jurisdiction.
              </Typography>
              {(needsStepUp || !verified) && (
                <PortalVerificationPanel
                  purpose='signature'
                  onVerified={() => {
                    setVerified(true)
                    setNeedsStepUp(false)
                  }}
                />
              )}
              <CustomTextField
                fullWidth
                label='Signer full name'
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
              />
              <FormControlLabel
                control={<Checkbox checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />}
                label='I have reviewed the proposal and accept the terms'
              />
              <Stack direction='row' gap={1} flexWrap='wrap'>
                  <Button
                  variant='contained'
                  disabled={loading || !acceptedTerms || signerName.trim().length < 2}
                  onClick={() =>
                    run('accept-sign', {
                      signerName,
                      acceptedTerms,
                      selectedOptionalIds
                    })
                  }
                >
                  Accept & sign
                </Button>
                {proposal.canDecline && (
                  <Button
                    variant='text'
                    color='error'
                    disabled={loading}
                    onClick={() => run('decline', { reason: 'Declined in portal' })}
                  >
                    Decline
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Button href='/portal/proposals' variant='outlined'>
        Back to proposals
      </Button>
    </PortalShell>
  )
}
