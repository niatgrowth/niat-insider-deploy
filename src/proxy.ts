import { NextRequest, NextResponse } from 'next/server';
import { isProtectedAppPath } from '@/lib/protectedPaths';
import { hasInsiderSessionCookiePair } from '@/lib/sessionCookie';

const AMA_ORIGIN = 'https://niat-ama.vercel.app';

function isTalkToSeniorsPath(pathname: string): boolean {
  return pathname === '/talk-to-seniors' || pathname.startsWith('/talk-to-seniors/');
}

function isOnboardingPath(pathname: string): boolean {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}

function isAuthPublicPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/register' ||
    pathname.startsWith('/register/')
  );
}

/**
 * Fresh registrations set `niat_needs_onboarding` after login; steer them to role selection
 * before browsing the main app (client RequireOnboarding mirrors this after hydration).
 */
function maybeRedirectNeedsOnboarding(
  request: NextRequest,
  pathname: string,
  accessToken: string | undefined
): NextResponse | null {
  if (!accessToken) return null;
  if (isOnboardingPath(pathname) || isAuthPublicPath(pathname)) return null;

  const needsOnboarding = request.cookies.get('niat_needs_onboarding')?.value === 'true';
  if (!needsOnboarding) return null;

  const url = request.nextUrl.clone();
  url.pathname = '/onboarding/role';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasSession = hasInsiderSessionCookiePair(accessToken, refreshToken);

  // Session = access_token and/or refresh_token (either may be missing/expired alone).
  // Client-side refresh rotates access_token; proxy does not call the backend here.
  if (pathname === '/' || pathname === '') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // Proxy /talk-to-seniors to AMA, stripping Set-Cookie so Insider HttpOnly cookies
  // (access_token, refresh_token) are never overwritten by the upstream app.
  if (isTalkToSeniorsPath(pathname)) {
    try {
      const amaUrl = new URL(pathname + request.nextUrl.search, AMA_ORIGIN);

      const amaResponse = await fetch(amaUrl.toString(), {
        method: request.method,
        headers: {
          accept: request.headers.get('accept') ?? '*/*',
          'accept-language': request.headers.get('accept-language') ?? '',
          'user-agent': request.headers.get('user-agent') ?? '',
          'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        },
      });

      const responseHeaders = new Headers();
      amaResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') {
          responseHeaders.append(key, value);
        }
      });

      return new NextResponse(amaResponse.body, {
        status: amaResponse.status,
        headers: responseHeaders,
      });
    } catch {
      return new NextResponse('Bad gateway', { status: 502 });
    }
  }

  if (isProtectedAppPath(pathname)) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const onboardingRedirect = maybeRedirectNeedsOnboarding(request, pathname, accessToken);
  if (onboardingRedirect) {
    return onboardingRedirect;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/talk-to-seniors',
    '/talk-to-seniors/:path*',
    '/home',
    '/home/:path*',
    '/write',
    '/write/:path*',
    '/contribute',
    '/contribute/:path*',
    '/profile',
    '/profile/:path*',
    '/my-articles',
    '/my-articles/:path*',
    '/onboarding',
    '/onboarding/review',
    '/onboarding/:path*',
    '/settings',
    '/settings/:path*',
    '/reviews',
    '/reviews/:path*',
    '/campuses',
    '/campus/:path*',
    '/articles',
    '/articles/:path*',
    '/article/:path*',
    '/search',
    '/how-to-guides',
    '/guide',
    '/about',
  ],
};
