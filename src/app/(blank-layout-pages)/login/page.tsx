import type { Metadata } from 'next'

import Login from '@views/Login'
import { getServerMode } from '@core/utils/serverHelpers'
import { requireGuest } from '@libs/auth/guards'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your LightForge account'
}

const LoginPage = async () => {
  await requireGuest()

  const mode = await getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
