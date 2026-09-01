import type { Metadata } from 'next'

import ForgotPassword from '@views/ForgotPassword'
import { getServerMode } from '@core/utils/serverHelpers'
import { requireGuest } from '@libs/auth/guards'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your LightForge password'
}

const ForgotPasswordPage = async () => {
  await requireGuest()

  const mode = await getServerMode()

  return <ForgotPassword mode={mode} />
}

export default ForgotPasswordPage
