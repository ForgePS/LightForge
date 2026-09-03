'use client'

import { useCallback, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

import type { CustomerPortalRecord } from '@libs/customer-portal/types'

type PortalPanelState = {
  portal: CustomerPortalRecord | null
  shortUrl: string | null
  secureUrl: string | null
  grantPrefix: string | null
  tenantPortalEnabled: boolean
  qrDataUrl: string | null
  notice: string | null
}

const emptyState: PortalPanelState = {
  portal: null,
  shortUrl: null,
  secureUrl: null,
  grantPrefix: null,
  tenantPortalEnabled: false,
  qrDataUrl: null,
  notice: null
}

export default function CustomerPortalPanel({ customerId }: { customerId: string }) {
  const [state, setState] = useState<PortalPanelState>(emptyState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch(`/api/admin/customer-portals/by-customer/${customerId}`)
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Unable to load portal')

      return
    }

    setState(prev => ({
      ...prev,
      portal: data.portal,
      shortUrl: data.shortUrl,
      grantPrefix: data.grantPrefix,
      tenantPortalEnabled: data.tenantPortalEnabled,
      // keep secureUrl/qr only from enable/rotate responses
      secureUrl: prev.portal?.id === data.portal?.id ? prev.secureUrl : null,
      qrDataUrl: prev.portal?.id === data.portal?.id ? prev.qrDataUrl : null,
      notice: null
    }))
  }, [customerId])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (url: string, body?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Request failed')

      setState(prev => ({
        ...prev,
        portal: data.portal || prev.portal,
        shortUrl: data.shortUrl || prev.shortUrl,
        secureUrl: data.secureUrl || prev.secureUrl,
        grantPrefix: data.grantPrefix || prev.grantPrefix,
        qrDataUrl: data.qrDataUrl || prev.qrDataUrl,
        notice: data.notice || null,
        tenantPortalEnabled: prev.tenantPortalEnabled
      }))
      setMessage(data.notice || 'Updated')

      const refresh = await fetch(`/api/admin/customer-portals/by-customer/${customerId}`)
      const refreshData = await refresh.json()

      if (refresh.ok) {
        setState(prev => ({
          ...prev,
          portal: refreshData.portal,
          shortUrl: refreshData.shortUrl,
          grantPrefix: refreshData.grantPrefix,
          tenantPortalEnabled: refreshData.tenantPortalEnabled
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setMessage('Copied to clipboard')
  }

  const portal = state.portal
  const active = portal?.status === 'active'

  return (
    <Stack spacing={2} className='mbs-2'>
      <Divider />
      <Typography variant='h6'>Customer Portal</Typography>

      {!state.tenantPortalEnabled && (
        <Alert severity='info'>
          Customer Portal is off for this workspace. Enable it under Settings → Customer Portal first.
        </Alert>
      )}

      {(error || message) && <Alert severity={error ? 'error' : 'success'}>{error || message}</Alert>}
      {state.notice && !message && <Alert severity='warning'>{state.notice}</Alert>}

      {portal ? (
        <Stack spacing={1}>
          <Stack direction='row' gap={1} alignItems='center' flexWrap='wrap'>
            <Typography variant='body2'>Status:</Typography>
            <Chip size='small' label={portal.status} color={active ? 'success' : 'default'} />
          </Stack>
          {state.shortUrl && (
            <Typography variant='body2'>
              Short URL: <code>{state.shortUrl}</code>
            </Typography>
          )}
          {portal.lastAccessAt && (
            <Typography variant='body2' color='text.secondary'>
              Last access: {portal.lastAccessAt}
            </Typography>
          )}
          {state.grantPrefix && (
            <Typography variant='body2' color='text.secondary'>
              Active grant prefix: {state.grantPrefix}…
            </Typography>
          )}
        </Stack>
      ) : (
        <Typography color='text.secondary'>No portal enabled for this customer yet.</Typography>
      )}

      {state.secureUrl && (
        <Alert severity='warning'>
          Secure link (shown once): <code style={{ wordBreak: 'break-all' }}>{state.secureUrl}</code>
        </Alert>
      )}

      {state.qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.qrDataUrl} alt='Customer portal QR code' width={180} height={180} />
      )}

      <Stack direction='row' gap={1} flexWrap='wrap'>
        {!active && (
          <Button
            variant='contained'
            disabled={loading || !state.tenantPortalEnabled}
            onClick={() => run(`/api/admin/customer-portals/by-customer/${customerId}/enable`)}
          >
            Enable Portal
          </Button>
        )}
        {active && portal && (
          <>
            <Button
              variant='outlined'
              disabled={loading || !state.shortUrl}
              onClick={() => state.shortUrl && copy(state.shortUrl)}
            >
              Copy Short URL
            </Button>
            <Button
              variant='outlined'
              disabled={loading || !state.secureUrl}
              onClick={() => state.secureUrl && copy(state.secureUrl)}
            >
              Copy Secure Link
            </Button>
            <Button
              variant='outlined'
              disabled={loading}
              href={
                state.secureUrl
                  ? `/api/admin/customer-portals/${portal.id}/qr?token=${encodeURIComponent(
                      new URL(state.secureUrl).searchParams.get('g') || ''
                    )}`
                  : `/api/admin/customer-portals/${portal.id}/qr`
              }
            >
              Download QR
            </Button>
            <Button
              variant='outlined'
              disabled={loading}
              onClick={() =>
                run(`/api/admin/customer-portals/${portal.id}/rotate-access`, {
                  reason: 'staff_rotate'
                })
              }
            >
              Regenerate Access
            </Button>
            <Button
              variant='outlined'
              disabled={loading}
              onClick={() => run(`/api/admin/customer-portals/${portal.id}/revoke-sessions`)}
            >
              Revoke Sessions
            </Button>
            <Button
              variant='text'
              color='error'
              disabled={loading}
              onClick={() => run(`/api/admin/customer-portals/${portal.id}/disable`)}
            >
              Disable Portal
            </Button>
          </>
        )}
      </Stack>

      {active && !state.secureUrl && (
        <Typography variant='caption' color='text.secondary'>
          The full secure link is only shown when you enable or regenerate access. Use Regenerate Access to create a
          new QR code and link.
        </Typography>
      )}
    </Stack>
  )
}
