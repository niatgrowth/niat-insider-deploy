import { NextRequest, NextResponse } from 'next/server';
import { requireProxySession } from '@/lib/proxySession';
import { clientRateLimitKey, slidingWindowRateLimit } from '@/lib/rateLimit';
import {
  QUESTIONS_LIST_REVALIDATE_SECONDS,
  getCachedAuthedProxyGet,
} from '@/lib/reviews/cachedProxyReads';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export const revalidate = QUESTIONS_LIST_REVALIDATE_SECONDS;

export async function GET(request: NextRequest) {
  const session = await requireProxySession();
  if (!session.ok) return session.response;

  const search = request.nextUrl.search;

  try {
    const { data, status } = await getCachedAuthedProxyGet(
      'reviews-questions-list',
      'questions/',
      search,
      session.accessToken!,
      QUESTIONS_LIST_REVALIDATE_SECONDS
    );

    return NextResponse.json(data, {
      status,
      headers: {
        'Cache-Control': 'private, max-age=120, stale-while-revalidate=60',
      },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 502;
    const body = (err as { data?: unknown }).data ?? { detail: 'Failed to load questions' };
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: Request) {
  const session = await requireProxySession();
  if (!session.ok) return session.response;
  const access = session.accessToken!;

  const rate = slidingWindowRateLimit(
    `reviews-questions-post:${clientRateLimitKey(req)}`,
    10,
    60_000
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { detail: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSec) },
      }
    );
  }

  const body = await req.json().catch(() => ({}));
  const upstream = await fetch(`${API_BASE}/api/questions/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
