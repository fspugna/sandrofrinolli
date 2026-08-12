import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

const locales = ['it', 'en', 'es']

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  request.nextUrl.pathname = `/it${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Locale redirects apply only to page routes. Public files (anything with an
  // extension), Next.js internals and API routes must reach the filesystem.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
