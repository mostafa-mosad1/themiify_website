import { NextResponse, type NextRequest } from 'next/server'

function isValidToken(val: string | null | undefined): boolean {
  if (!val) return false
  const str = String(val).trim()
  return str !== '' && str !== 'undefined' && str !== 'null' && str !== '[object Object]'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets, public files, and API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Cache control headers for protected routing
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  // Read auth tokens from cookies
  const rawAuthToken =
    request.cookies.get('authToken')?.value ||
    request.cookies.get('bearer_token')?.value
  const rawAdminToken = request.cookies.get('adminToken')?.value

  const hasAuthToken = isValidToken(rawAuthToken)
  const hasAdminToken = isValidToken(rawAdminToken)

  // Read session cookie
  const localAuthSession = request.cookies.get('localAuthSession')?.value
  let localSession: {
    email?: string
    isAdmin?: boolean
    is_super_admin?: boolean
    userRole?: string
    isLoggedIn?: boolean
  } | null = null

  if (localAuthSession && localAuthSession.trim() !== '' && localAuthSession !== 'undefined') {
    try {
      localSession = JSON.parse(decodeURIComponent(localAuthSession))
    } catch {
      localSession = null
    }
  }

  const isLoggedIn = Boolean(
    hasAuthToken ||
    hasAdminToken ||
    (localSession?.isLoggedIn && isValidToken(localSession?.email))
  )

  const isSuperAdmin = Boolean(
    localSession?.is_super_admin ||
    localSession?.userRole === 'super_admin'
  )

  const isAdmin = Boolean(
    hasAdminToken ||
    isSuperAdmin ||
    localSession?.isAdmin ||
    localSession?.userRole === 'admin' ||
    localSession?.userRole === 'super_admin'
  )

  const isAdminPath = pathname.startsWith('/admin')
  const isAuthPath = pathname === '/login' || pathname === '/register'
  const isProtectedClientPath = pathname === '/settings'

  // 1. Admin paths protection (/admin/*)
  if (isAdminPath) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isAdmin) {
      // User is logged in but is not an admin
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // 2. Protected client routes (/settings)
  if (isProtectedClientPath) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // 3. Auth pages (/login, /register) when already logged in
  if (isAuthPath && isLoggedIn) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}