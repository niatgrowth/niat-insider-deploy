import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hasInsiderSessionCookiePair } from '@/lib/sessionCookie';

/**
 * Proxy route handlers: require a present session (access and/or refresh cookie).
 * Bearer calls still need access_token; client refresh runs before mutating fetches.
 */
export async function requireProxySession(): Promise<
  | { ok: true; accessToken: string | undefined }
  | { ok: false; response: NextResponse }
> {
  const store = await cookies();
  const accessToken = store.get('access_token')?.value;
  const refreshToken = store.get('refresh_token')?.value;

  if (!hasInsiderSessionCookiePair(accessToken, refreshToken)) {
    return {
      ok: false,
      response: NextResponse.json({ detail: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { detail: 'Session expired; refresh required' },
        { status: 401 }
      ),
    };
  }

  return { ok: true, accessToken };
}
