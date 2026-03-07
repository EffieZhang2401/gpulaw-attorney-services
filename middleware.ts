import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { auth0, isAuth0Configured } from './lib/auth0';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use a locale prefix
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuth0Configured || !auth0) {
    if (pathname.startsWith('/auth')) {
      return NextResponse.json(
        { error: 'Authentication is not configured on this server' },
        { status: 503 }
      );
    }

    return intlMiddleware(request);
  }

  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return auth0.middleware(request);
  }

  const authResponse = await auth0.middleware(request);
  const intlResponse = intlMiddleware(request);

  // Preserve Auth0 rolling-session cookies while keeping locale routing.
  for (const cookie of authResponse.cookies.getAll()) {
    intlResponse.cookies.set(cookie);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)'
  ]
};
