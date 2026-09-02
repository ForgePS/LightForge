'use client'

import { useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import {
  BRANDING_ASSET_FIELDS,
  BRANDING_ASSET_LABELS,
  type BrandingAssetKey,
  type BrandingSettings
} from '@libs/branding/types'

type BrandingUploadSectionProps = {
  branding: BrandingSettings
  uploadUrl: string
  disabled?: boolean
  onBrandingChange: (branding: BrandingSettings) => void
  onMessage?: (message: string | null, error: string | null) => void
}

function AssetPreview({ url, label }: { url?: string | null; label: string }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: 120,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <Typography variant='body2' color='text.secondary'>
          No {label.toLowerCase()} uploaded
        </Typography>
      )}
    </Box>
  )
}

function BrandingAssetCard({
  asset,
  branding,
  uploadUrl,
  disabled,
  onBrandingChange,
  onMessage
}: {
  asset: BrandingAssetKey
  branding: BrandingSettings
  uploadUrl: string
  disabled?: boolean
  onBrandingChange: (branding: BrandingSettings) => void
  onMessage?: (message: string | null, error: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const field = BRANDING_ASSET_FIELDS[asset]
  const url = branding[field]
  const meta = BRANDING_ASSET_LABELS[asset]

  const uploadFile = async (file: File) => {
    setUploading(true)
    onMessage?.(null, null)

    try {
      const formData = new FormData()

      formData.set('asset', asset)
      formData.set('file', file)

      const res = await fetch(uploadUrl, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      onBrandingChange(data.branding)
      onMessage?.(`${meta.title} uploaded`, null)
    } catch (err) {
      onMessage?.(null, err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAsset = async () => {
    setUploading(true)
    onMessage?.(null, null)

    try {
      const res = await fetch(`${uploadUrl}?asset=${asset}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to remove asset')

      onBrandingChange(data.branding)
      onMessage?.(`${meta.title} removed`, null)
    } catch (err) {
      onMessage?.(null, err instanceof Error ? err.message : 'Unable to remove asset')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={2}>
          <div>
            <Typography variant='subtitle1' className='font-medium'>
              {meta.title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {meta.description}
            </Typography>
          </div>
          <AssetPreview url={url} label={meta.title} />
          <input
            ref={inputRef}
            type='file'
            accept='image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon'
            hidden
            onChange={e => {
              const file = e.target.files?.[0]

              if (file) void uploadFile(file)
            }}
          />
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            <Button variant='contained' disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? 'Uploading…' : url ? 'Replace file' : 'Upload file'}
            </Button>
            {url && (
              <Button variant='outlined' color='warning' disabled={disabled || uploading} onClick={() => void removeAsset()}>
                Remove
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function BrandingUploadSection({
  branding,
  uploadUrl,
  disabled,
  onBrandingChange,
  onMessage
}: BrandingUploadSectionProps) {
  const saveColors = async () => {
    onMessage?.(null, null)

    try {
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor: branding.primaryColor || null,
          accentColor: branding.accentColor || null
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to save colors')

      onBrandingChange(data.branding)
      onMessage?.('Brand colors saved', null)
    } catch (err) {
      onMessage?.(null, err instanceof Error ? err.message : 'Unable to save colors')
    }
  }

  return (
    <Stack spacing={3}>
      <Typography color='text.secondary'>
        Upload logos and favicon files directly. Supported formats: PNG, JPG, SVG, WEBP, and ICO.
      </Typography>

      <Grid container spacing={2}>
        {(['logo', 'logoDark', 'favicon'] as BrandingAssetKey[]).map(asset => (
          <Grid key={asset} size={{ xs: 12, md: 4 }}>
            <BrandingAssetCard
              asset={asset}
              branding={branding}
              uploadUrl={uploadUrl}
              disabled={disabled}
              onBrandingChange={onBrandingChange}
              onMessage={onMessage}
            />
          </Grid>
        ))}
      </Grid>

      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant='subtitle1' className='font-medium'>
              Brand colors
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Primary color'
                  type='color'
                  value={branding.primaryColor || '#7367F0'}
                  onChange={e => onBrandingChange({ ...branding, primaryColor: e.target.value })}
                  disabled={disabled}
                  slotProps={{ input: { sx: { height: 56 } } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Accent color'
                  type='color'
                  value={branding.accentColor || '#28C76F'}
                  onChange={e => onBrandingChange({ ...branding, accentColor: e.target.value })}
                  disabled={disabled}
                  slotProps={{ input: { sx: { height: 56 } } }}
                />
              </Grid>
            </Grid>
            <Button variant='outlined' disabled={disabled} onClick={() => void saveColors()} className='self-start'>
              Save brand colors
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
