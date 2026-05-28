// @deprecated — use insiderReviewsClient + React Query (src/lib/reviews/insiderReviewsClient.ts)

const BASE = '';

const fetchOpts: RequestInit = { credentials: 'include', cache: 'no-store' };

export const reviewsApi = {
  // Questions
  getMyQuestions: (userId: string, cursor?: string) => {
    const params = new URLSearchParams({ author: userId, page_size: '10' });
    if (cursor) params.set('cursor', cursor);
    return fetch(`${BASE}/api/proxy/reviews/questions?${params}`, fetchOpts).then((r) => r.json());
  },

  getMyAnswers: (userId: string, cursor?: string) => {
    const params = new URLSearchParams({ answer_author: userId, page_size: '10' });
    if (cursor) params.set('cursor', cursor);
    return fetch(`${BASE}/api/proxy/reviews/questions?${params}`, fetchOpts).then((r) => r.json());
  },

  getUnansweredQuestions: (cursor?: string) => {
    const params = new URLSearchParams({ answered: 'false', page_size: '10' });
    if (cursor) params.set('cursor', cursor);
    return fetch(`${BASE}/api/proxy/reviews/questions?${params}`, fetchOpts).then((r) => r.json());
  },

  getQuestionBySlug: (slug: string) =>
    fetch(`${BASE}/api/proxy/reviews/questions/${slug}`, fetchOpts).then((r) => r.json()),

  askQuestion: (body: { title: string; body: string }) =>
    fetch(`${BASE}/api/proxy/reviews/questions`, {
      ...fetchOpts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  postAnswer: (slug: string, body: { body: string }) =>
    fetch(`${BASE}/api/proxy/reviews/questions/${slug}/answers`, {
      ...fetchOpts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  upvoteQuestion: (slug: string) =>
    fetch(`${BASE}/api/proxy/reviews/questions/${slug}/upvote`, {
      ...fetchOpts,
      method: 'POST',
    }).then((r) => r.json()),

  downvoteQuestion: (slug: string) =>
    fetch(`${BASE}/api/proxy/reviews/questions/${slug}/downvote`, {
      ...fetchOpts,
      method: 'POST',
    }).then((r) => r.json()),

  // Notifications
  getUnreadCount: () =>
    fetch(`${BASE}/api/proxy/reviews/notifications/unread`, fetchOpts).then((r) => r.json()),

  getNotifications: () =>
    fetch(`${BASE}/api/proxy/reviews/notifications`, fetchOpts).then((r) => r.json()),

  markNotificationRead: (id: string) =>
    fetch(`${BASE}/api/proxy/reviews/notifications/${id}/read`, {
      ...fetchOpts,
      method: 'POST',
    }).then((r) => r.json()),

  markAllRead: () =>
    fetch(`${BASE}/api/proxy/reviews/notifications/mark-all-read`, {
      ...fetchOpts,
      method: 'POST',
    }).then((r) => r.json()),
};
