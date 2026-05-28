import { NextRequest, NextResponse } from 'next/server';
import { requireProxySession } from '@/lib/proxySession';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

type ProxyGetOptions = {
  /** Next.js fetch revalidate seconds; omit for no-store. */
  revalidate?: number;
  responseHeaders?: HeadersInit;
};

export async function proxyReviewsGet(
  request: NextRequest,
  upstreamPath: string,
  options?: ProxyGetOptions
): Promise<NextResponse> {
  const session = await requireProxySession();
  if (!session.ok) return session.response;
  const access = session.accessToken!;

  const search = request.nextUrl.search;
  const upstream = await fetch(`${API_BASE}/api/${upstreamPath}${search}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    ...(options?.revalidate != null
      ? { next: { revalidate: options.revalidate } }
      : { cache: 'no-store' as const }),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, {
    status: upstream.status,
    headers: options?.responseHeaders,
  });
}

export async function proxyReviewsGetPublic(
  upstreamPath: string,
  options?: ProxyGetOptions
): Promise<NextResponse> {
  const upstream = await fetch(`${API_BASE}/api/${upstreamPath}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...(options?.revalidate != null
      ? { next: { revalidate: options.revalidate } }
      : { cache: 'no-store' as const }),
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, {
    status: upstream.status,
    headers: options?.responseHeaders,
  });
}
