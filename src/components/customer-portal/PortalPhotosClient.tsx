'use client'

import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'

import PortalShell from '@components/customer-portal/PortalShell'

type Photo = {
  id: string
  title: string
  category: string
  url: string
  caption: string | null
  capturedAt: string | null
  altText: string | null
}

export default function PortalPhotosClient({
  photos,
  categories,
  error
}: {
  photos: Photo[]
  categories: string[]
  error?: string
}) {
  const [category, setCategory] = useState<string>('All')
  const [active, setActive] = useState<Photo | null>(null)

  const filtered = useMemo(
    () => (category === 'All' ? photos : photos.filter(photo => photo.category === category)),
    [photos, category]
  )

  if (error) {
    return (
      <PortalShell title='Photos'>
        <Alert severity='warning'>{error}</Alert>
      </PortalShell>
    )
  }

  return (
    <PortalShell title='Photos' subtitle='Design previews and customer-visible installation photos'>
      <Stack direction='row' gap={1} flexWrap='wrap'>
        <Chip label='All' color={category === 'All' ? 'primary' : 'default'} onClick={() => setCategory('All')} />
        {categories.map(item => (
          <Chip
            key={item}
            label={item}
            color={category === item ? 'primary' : 'default'}
            onClick={() => setCategory(item)}
          />
        ))}
      </Stack>

      {filtered.length === 0 ? (
        <Alert severity='info'>No customer-visible photos yet.</Alert>
      ) : (
        <Stack direction='row' flexWrap='wrap' gap={1.5}>
          {filtered.map(photo => (
            <Card
              key={photo.id}
              elevation={0}
              sx={{ width: 'calc(50% - 6px)', borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
              onClick={() => setActive(photo)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.altText || photo.title}
                style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
              />
              <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                <Typography variant='body2' fontWeight={600} noWrap>
                  {photo.title}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {photo.category}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(active)} onClose={() => setActive(null)} fullWidth maxWidth='sm'>
        {active && (
          <Stack>
            <Stack direction='row' justifyContent='flex-end'>
              <IconButton onClick={() => setActive(null)}>
                <i className='tabler-x' />
              </IconButton>
            </Stack>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt={active.altText || active.title} style={{ width: '100%', display: 'block' }} />
            <Stack className='p-4' spacing={0.5}>
              <Typography variant='h6'>{active.title}</Typography>
              {active.caption && <Typography color='text.secondary'>{active.caption}</Typography>}
              <Typography variant='caption' color='text.secondary'>
                {active.category}
                {active.capturedAt ? ` · ${active.capturedAt}` : ''}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Dialog>
    </PortalShell>
  )
}
