'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

import CustomTextField from '@core/components/mui/TextField'
import CustomerPortalPanel from '@components/customer-portal/CustomerPortalPanel'
import type { ModuleDef } from '@libs/modules/registry'

type RecordRow = Record<string, unknown> & { id: string }

function emptyForm(module: ModuleDef): Record<string, string | number> {
  return Object.fromEntries(
    module.fields.map(field => [field.key, field.type === 'number' ? 0 : ''])
  ) as Record<string, string | number>
}

export default function ModulePageClient({
  module,
  initialRecords
}: {
  module: ModuleDef
  initialRecords: RecordRow[]
}) {
  const router = useRouter()
  const [records, setRecords] = useState(initialRecords)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<RecordRow | null>(null)
  const [form, setForm] = useState<Record<string, string | number>>(emptyForm(module))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const listFields = useMemo(() => module.fields.filter(f => f.list), [module.fields])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm(module))
    setError(null)
    setOpen(true)
  }

  const openEdit = (row: RecordRow) => {
    setEditing(row)
    const next = emptyForm(module)

    for (const field of module.fields) {
      const value = row[field.key]
      next[field.key] = (typeof value === 'string' || typeof value === 'number' ? value : undefined) ?? (field.type === 'number' ? 0 : '')
    }

    setForm(next)
    setError(null)
    setOpen(true)
  }

  const save = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = { ...form }

      for (const field of module.fields) {
        if (field.type === 'number') {
          payload[field.key] = Number(payload[field.key] || 0)
        }
      }

      if (editing) {
        const res = await fetch(`/api/tenants/current/${module.collection}/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Update failed')
        setRecords(prev => prev.map(r => (r.id === editing.id ? data.record : r)))
      } else {
        const res = await fetch(`/api/tenants/current/${module.collection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Create failed')
        setRecords(prev => [data.record, ...prev])
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (row: RecordRow) => {
    if (!window.confirm(`Delete this ${module.singular.toLowerCase()}?`)) return

    const res = await fetch(`/api/tenants/current/${module.collection}/${row.id}`, { method: 'DELETE' })

    if (res.ok) {
      setRecords(prev => prev.filter(r => r.id !== row.id))
      router.refresh()
    }
  }

  const formatCell = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'number' && String(value).length > 3) {
      // heuristic for cents fields
      return value
    }

    return String(value)
  }

  return (
    <Stack spacing={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={2}>
        <div>
          <Typography variant='h4'>{module.title}</Typography>
          <Typography color='text.secondary'>{module.description}</Typography>
        </div>
        <Button variant='contained' onClick={openCreate}>
          New {module.singular.toLowerCase()}
        </Button>
      </Stack>

      <Card>
        <CardContent className='overflow-x-auto'>
          {records.length === 0 ? (
            <Typography color='text.secondary'>No {module.title.toLowerCase()} yet.</Typography>
          ) : (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  {listFields.map(field => (
                    <TableCell key={field.key}>{field.label}</TableCell>
                  ))}
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map(row => (
                  <TableRow key={row.id} hover>
                    {listFields.map(field => (
                      <TableCell key={field.key}>
                        {field.key === 'status' ? (
                          <Chip size='small' label={String(row[field.key] || '—')} />
                        ) : (
                          formatCell(row[field.key])
                        )}
                      </TableCell>
                    ))}
                    <TableCell align='right'>
                      <IconButton size='small' onClick={() => openEdit(row)}>
                        <i className='tabler-edit' />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => remove(row)}>
                        <i className='tabler-trash' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={module.key === 'customers' && editing ? 'md' : 'sm'}
      >
        <DialogTitle>
          {editing ? `Edit ${module.singular}` : `New ${module.singular}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} className='mbs-2'>
            {error && <Alert severity='error'>{error}</Alert>}
            {module.fields.map(field =>
              field.type === 'select' ? (
                <CustomTextField
                  key={field.key}
                  select
                  fullWidth
                  label={field.label}
                  value={String(form[field.key] ?? '')}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                >
                  {(field.options || []).map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              ) : (
                <CustomTextField
                  key={field.key}
                  fullWidth
                  label={field.label}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  multiline={field.type === 'textarea'}
                  minRows={field.type === 'textarea' ? 3 : undefined}
                  value={String(form[field.key] ?? '')}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  slotProps={field.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                />
              )
            )}
            {module.key === 'customers' && editing && <CustomerPortalPanel customerId={editing.id} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={save} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
