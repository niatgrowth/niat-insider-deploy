import type { ReviewsApiClient } from '@niat/reviews-ui';
import type { PaginatedQuestions, Question } from '@niat/reviews-ui/types/question';

const fetchOpts: RequestInit = { credentials: 'include', cache: 'no-store' };

/** Stable public reads — allow browser/CDN to use proxy Cache-Control headers. */
const cacheableReadOpts: RequestInit = { credentials: 'include' };

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) {
    throw Object.assign(new Error('Reviews API error'), { status: res.status, data });
  }
  return data;
}

export function createInsiderReviewsClient(): ReviewsApiClient {
  return buildInsiderReviewsClient();
}

function buildInsiderReviewsClient(): ReviewsApiClient {
  return {
    async getQuestions(params) {
      const qs = new URLSearchParams(params);
      const res = await fetch(`/api/proxy/reviews/questions?${qs}`, cacheableReadOpts);
      return parseJson<PaginatedQuestions>(res);
    },

    async searchQuestions({ q, ordering, cursor, page_size }) {
      const qs = new URLSearchParams({ q });
      if (ordering) qs.set('ordering', ordering);
      if (cursor) qs.set('cursor', cursor);
      if (page_size) qs.set('page_size', page_size);
      const res = await fetch(`/api/proxy/reviews/questions/search?${qs}`, fetchOpts);
      return parseJson<PaginatedQuestions>(res);
    },

    async getSearchSuggestions(q) {
      const qs = new URLSearchParams({ q });
      const res = await fetch(`/api/proxy/reviews/questions/search/suggestions?${qs}`, fetchOpts);
      return parseJson<Question[]>(res);
    },

    async getQuestionCategories() {
      const res = await fetch('/api/proxy/reviews/questions/categories', cacheableReadOpts);
      const data = await parseJson<{ categories?: string[] }>(res);
      return data.categories ?? [];
    },

    async getFAQs(limit?: number) {
      const qs = limit != null ? `?limit=${limit}` : '';
      const res = await fetch(`/api/proxy/reviews/faqs${qs}`, cacheableReadOpts);
      return parseJson<Question[]>(res);
    },

    async getQuestionDetail(slug) {
      const res = await fetch(`/api/proxy/reviews/questions/${encodeURIComponent(slug)}`, fetchOpts);
      return parseJson<Question>(res);
    },

    async createQuestion(payload) {
      const res = await fetch('/api/proxy/reviews/questions', {
        ...fetchOpts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return parseJson<Question>(res);
    },

    async submitAnswer(slug, body) {
      const res = await fetch(`/api/proxy/reviews/questions/${encodeURIComponent(slug)}/answers`, {
        ...fetchOpts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      return parseJson(res);
    },

    async upvoteQuestion(slug) {
      const res = await fetch(`/api/proxy/reviews/questions/${encodeURIComponent(slug)}/upvote`, {
        ...fetchOpts,
        method: 'POST',
      });
      return parseJson(res);
    },

    async downvoteQuestion(slug) {
      const res = await fetch(`/api/proxy/reviews/questions/${encodeURIComponent(slug)}/downvote`, {
        ...fetchOpts,
        method: 'POST',
      });
      return parseJson(res);
    },

    async getSeniorDashboard() {
      const res = await fetch('/api/proxy/reviews/dashboard/senior', fetchOpts);
      return parseJson(res);
    },

    async fetchUnreadCount() {
      const res = await fetch('/api/proxy/reviews/notifications/unread', fetchOpts);
      return parseJson(res);
    },

    async fetchNotifications(page = 1, unreadOnly?: boolean) {
      const qs = new URLSearchParams({ page: String(page) });
      if (unreadOnly) qs.set('unread_only', 'true');
      const res = await fetch(`/api/proxy/reviews/notifications?${qs}`, fetchOpts);
      return parseJson(res);
    },

    async markNotificationRead(id) {
      const res = await fetch(`/api/proxy/reviews/notifications/${id}/read`, {
        ...fetchOpts,
        method: 'POST',
      });
      return parseJson(res);
    },

    async markAllNotificationsRead() {
      const res = await fetch('/api/proxy/reviews/notifications/mark-all-read', {
        ...fetchOpts,
        method: 'POST',
      });
      return parseJson(res);
    },
  };
}

/** Shared proxy client for app pages (prefer React Query + this over reviewsApi). */
export const insiderReviewsClient = buildInsiderReviewsClient();
