import type { ReviewsUser } from '@/store/reviewsStore';

export async function fetchReviewsUser(): Promise<{
  ok: boolean;
  user: ReviewsUser | null;
}> {
  const res = await fetch('/api/proxy/reviews/me', {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) return { ok: false, user: null };
  return { ok: true, user: data as ReviewsUser };
}

export function reviewsErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string' && d.detail.trim()) return d.detail.trim();
    if (Array.isArray(d.detail) && typeof d.detail[0] === 'string') return d.detail[0];
  }
  return fallback;
}
