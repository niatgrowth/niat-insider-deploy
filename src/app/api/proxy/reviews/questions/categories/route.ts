import { NextResponse } from 'next/server';
import { requireProxySession } from '@/lib/proxySession';
import {
  CATEGORY_REVALIDATE_SECONDS,
  getCachedAuthedProxyGet,
} from '@/lib/reviews/cachedProxyReads';

export const revalidate = 600;

export async function GET() {
  const session = await requireProxySession();
  if (!session.ok) return session.response;

  try {
    const { data, status } = await getCachedAuthedProxyGet(
      'reviews-categories',
      'questions/categories/',
      '',
      session.accessToken!,
      CATEGORY_REVALIDATE_SECONDS
    );

    return NextResponse.json(data, {
      status,
      headers: {
        'Cache-Control': 'private, max-age=600, stale-while-revalidate=120',
      },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 502;
    const body = (err as { data?: unknown }).data ?? { detail: 'Failed to load categories' };
    return NextResponse.json(body, { status });
  }
}
