import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
const FAQ_REVALIDATE_SECONDS = 300;

type FaqCacheEntry = { data: unknown; expiresAt: number };
const memoryFaqCaches = new Map<string, FaqCacheEntry>();

async function loadFaqsFromUpstream(search: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/faqs/${search}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: FAQ_REVALIDATE_SECONDS },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error('FAQs upstream error'), { status: res.status, data });
  }
  return data;
}

const getCachedFaqs = unstable_cache(
  (search: string) => loadFaqsFromUpstream(search),
  ['reviews-faqs'],
  { revalidate: FAQ_REVALIDATE_SECONDS, tags: ['reviews-faqs'] }
);

/** Route segment ISR — reuse cached FAQs without hitting Django every request. */
export const revalidate = FAQ_REVALIDATE_SECONDS;

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get('limit');
  const search = limit ? `?limit=${encodeURIComponent(limit)}` : '';

  try {
    const now = Date.now();
    const memKey = search || 'all';
    const memHit = memoryFaqCaches.get(memKey);
    if (memHit && memHit.expiresAt > now) {
      return NextResponse.json(memHit.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Faq-Cache': 'memory',
        },
      });
    }

    const data = await getCachedFaqs(search);
    memoryFaqCaches.set(memKey, {
      data,
      expiresAt: now + FAQ_REVALIDATE_SECONDS * 1000,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 502;
    const body = (err as { data?: unknown }).data ?? { detail: 'Failed to load FAQs' };
    return NextResponse.json(body, { status });
  }
}
