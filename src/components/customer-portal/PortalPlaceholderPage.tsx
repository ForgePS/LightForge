import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

export default function PortalPlaceholderPage({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <Stack className='min-bs-screen items-center justify-center p-6' spacing={2} maxWidth={480} mx='auto'>
      <Typography variant='h4' textAlign='center'>
        {title}
      </Typography>
      <Alert severity='info'>{description}</Alert>
      <Button href='/portal/home' variant='contained'>
        Back to home
      </Button>
    </Stack>
  )
}
