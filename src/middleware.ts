import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || '__session'

const authPages = ['/login', '/register', '/forgot-password']
const publicPrefixes = [
  '/api/auth',
  '/api/billing/webhook',
  '/api/customer-portal',
  '/p',
  '/portal'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)

  if (publicPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next()
  }

  const isAuthPage = authPages.some(page => pathname === page || pathname.startsWith(`${page}/`))

  if (isAuthPage) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('redirectTo', pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)']
}
