import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import type { ChildrenType } from '@core/types'

import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import ScrollToTop from '@core/components/scroll-to-top'
import BrandingEffects from '@components/branding/BrandingEffects'
import { TenantProvider } from '@components/providers/TenantProvider'

import { getMode, getSystemMode } from '@core/utils/serverHelpers'
import { getActiveTenant, listUserTenants } from '@libs/auth/session'
import { requireSession } from '@libs/auth/guards'
import { adminDb } from '@libs/firebase/admin'

const Layout = async (props: ChildrenType) => {
  const { children } = props
  const user = await requireSession()
  const [tenant, tenants] = await Promise.all([getActiveTenant(user), listUserTenants(user.uid)])

  const accessBlocked =
    Boolean(tenant) &&
    (tenant!.status === 'suspended' ||
      tenant!.subscriptionStatus === 'canceled' ||
      tenant!.subscriptionStatus === 'paused')

  let overSeatLimit = false

  if (tenant?.seats && tenant.seats > 0) {
    const membersSnap = await adminDb.collection('tenants').doc(tenant.id).collection('members').get()

    overSeatLimit = membersSnap.size > tenant.seats
  }

  const direction = 'ltr'
  const mode = await getMode()
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      <TenantProvider value={{ user, tenant, tenants }}>
        <BrandingEffects branding={tenant?.branding} />
        {accessBlocked && !user.isPlatformAdmin && (
          <Alert
            severity='warning'
            className='rounded-none'
            action={
              <Button href='/settings' color='inherit' size='small'>
                Settings & billing
              </Button>
            }
          >
            This workspace is {tenant?.status === 'suspended' ? 'suspended' : 'not billable'}. Changes are blocked until
            access is restored.
          </Alert>
        )}
        {overSeatLimit && (
          <Alert
            severity='info'
            className='rounded-none'
            action={
              <Button href='/settings' color='inherit' size='small'>
                Manage seats
              </Button>
            }
          >
            Seat limit exceeded ({tenant?.seats} included). Upgrade the plan or remove members.
          </Alert>
        )}
        <LayoutWrapper
          systemMode={systemMode}
          verticalLayout={
            <VerticalLayout navigation={<Navigation mode={mode} />} navbar={<Navbar />} footer={<VerticalFooter />}>
              {children}
            </VerticalLayout>
          }
          horizontalLayout={
            <HorizontalLayout header={<Header />} footer={<HorizontalFooter />}>
              {children}
            </HorizontalLayout>
          }
        />
        <ScrollToTop className='mui-fixed'>
          <Button
            variant='contained'
            className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
          >
            <i className='tabler-arrow-up' />
          </Button>
        </ScrollToTop>
      </TenantProvider>
    </Providers>
  )
}

export default Layout
