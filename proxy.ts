import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/feed', '/profile', '/recipes/new', '/explore', '/notifications', '/friends', '/settings']
const AUTH_PATH = '/auth'
const AUTH_CALLBACK_PATH = '/auth/callback'

type CookieToSet = {
  name: string
  value: string
  options?: Parameters<NextResponse['cookies']['set']>[2]
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  )
  const isAuthPath = pathname === AUTH_PATH
  const isAuthCallbackPath = pathname.startsWith(AUTH_CALLBACK_PATH)

  if (!isProtectedPath && !isAuthPath && !isAuthCallbackPath) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = AUTH_PATH
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_PATH
    return NextResponse.redirect(url)
  }

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}