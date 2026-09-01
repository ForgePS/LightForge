'use client'

import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { PlatformPageHeader } from '@components/platform/platformUi'
import { formatPlatformDate } from '@libs/platform/format'
import type { TenantTemplateSummary } from '@libs/firebase/types'

export default function PlatformTemplatesClient({ templates }: { templates: TenantTemplateSummary[] }) {
  return (
    <Stack spacing={4}>
      <PlatformPageHeader
        title='Tenant templates'
        subtitle='Demo and clone sources used when provisioning new trial workspaces.'
        breadcrumbs={[
          { label: 'Platform', href: '/platform' },
          { label: 'Templates' }
        ]}
      />

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography color='text.secondary'>
              New self-serve signups clone from the configured template tenant. Mark a tenant as template in tenant settings to use it as a provisioning source.
            </Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Template</TableCell>
                  <TableCell>Source tenant</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color='text.secondary' sx={{ py: 4, textAlign: 'center' }}>
                        No templates configured yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {templates.map(template => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography className='font-medium'>{template.name}</Typography>
                        <Chip size='small' label={template.id} variant='outlined' className='self-start' />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{template.sourceTenantName || template.sourceTenantId}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {template.sourceTenantId}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatPlatformDate(template.createdAt)}</TableCell>
                    <TableCell align='right'>
                      <Link href={`/platform/tenants/${template.sourceTenantId}`} className='no-underline'>
                        View source tenant
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
