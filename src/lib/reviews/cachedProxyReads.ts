import { unstable_cache } from 'next/cache';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export const CATEGORY_REVALIDATE_SECONDS = 600;
export const QUESTIONS_LIST_REVALIDATE_SECONDS = 120;

type UpstreamResult = { data: unknown; status: number };

async function fetchAuthedUpstream(
  upstreamPath: string,
  search: string,
  accessToken: string,
  revalidateSeconds: number
): Promise<UpstreamResult> {
  const res = await fetch(`${API_BASE}/api/${upstreamPath}${search}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: revalidateSeconds },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error('Reviews upstream error'), { status: res.status, data });
  }
  return { data, status: res.status };
}

/** Module-level cache — must not wrap unstable_cache per request. */
const getCachedAuthedProxy = unstable_cache(
  async (
    cacheNamespace: string,
    upstreamPath: string,
    search: string,
    accessToken: string,
    revalidateSeconds: number
  ) => {
    void cacheNamespace;
    return fetchAuthedUpstream(upstreamPath, search, accessToken, revalidateSeconds);
  },
  ['reviews-authed-proxy'],
  { revalidate: CATEGORY_REVALIDATE_SECONDS, tags: ['reviews-authed-proxy'] }
);

/**
 * Cache stable authed GET responses by namespace + query string.
 * Safe when payload is the same for all logged-in users (categories, public question lists).
 */
export function getCachedAuthedProxyGet(
  cacheNamespace: string,
  upstreamPath: string,
  search: string,
  accessToken: string,
  revalidateSeconds: number
): Promise<UpstreamResult> {
  return getCachedAuthedProxy(
    cacheNamespace,
    upstreamPath,
    search || '',
    accessToken,
    revalidateSeconds
  );
}
