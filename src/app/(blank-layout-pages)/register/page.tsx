import type { Metadata } from 'next'

import Register from '@views/Register'
import { getServerMode } from '@core/utils/serverHelpers'
import { requireGuest } from '@libs/auth/guards'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your LightForge trial workspace'
}

const RegisterPage = async () => {
  await requireGuest()

  const mode = await getServerMode()

  return <Register mode={mode} />
}

export default RegisterPage
