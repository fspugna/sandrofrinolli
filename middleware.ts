import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['it', 'en', 'es'];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Se il percorso non inizia già con una lingua, reindirizza a /it/...
	const pathnameHasLocale = locales.some(
		(locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	if (pathnameHasLocale) return;

	request.nextUrl.pathname = `/it${pathname}`;
	return NextResponse.redirect(request.nextUrl);
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};