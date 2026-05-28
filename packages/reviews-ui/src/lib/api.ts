import type { ReviewsApiClient } from '@niat/reviews-ui/lib/api-types';
import type { PaginatedQuestions, Question } from '@niat/reviews-ui/types/question';

let client: ReviewsApiClient | null = null;

export function setReviewsApiClient(next: ReviewsApiClient | null) {
  client = next;
}

function requireClient(): ReviewsApiClient {
  if (!client) {
    throw new Error('Reviews API client not initialized. Wrap the tree in ReviewsUiProvider.');
  }
  return client;
}

export async function getQuestions(params: Record<string, string>): Promise<PaginatedQuestions> {
  return requireClient().getQuestions(params);
}

export async function searchQuestions(params: {
  q: string;
  cursor?: string;
  order_by?: string;
}): Promise<PaginatedQuestions> {
  return requireClient().searchQuestions({
    q: params.q,
    ordering: params.order_by,
    cursor: params.cursor,
  });
}

export async function getSearchSuggestions(q: string): Promise<Question[]> {
  const c = requireClient();
  if ('getSearchSuggestions' in c && typeof c.getSearchSuggestions === 'function') {
    return c.getSearchSuggestions(q);
  }
  return [];
}

export async function getFAQs(limit?: number): Promise<Question[]> {
  return requireClient().getFAQs(limit);
}

export async function getQuestionCategories(): Promise<string[]> {
  return requireClient().getQuestionCategories();
}

export async function fetchNotifications(page = 1, unreadOnly?: boolean): Promise<unknown> {
  const c = requireClient();
  if ('fetchNotifications' in c && typeof c.fetchNotifications === 'function') {
    return c.fetchNotifications(page, unreadOnly);
  }
  return c.fetchNotifications();
}

export async function fetchUnreadCount(): Promise<{ count?: number; unread_count?: number }> {
  return requireClient().fetchUnreadCount();
}

export async function markNotificationRead(id: string): Promise<unknown> {
  return requireClient().markNotificationRead(id);
}

export async function markAllNotificationsRead(): Promise<unknown> {
  return requireClient().markAllNotificationsRead();
}

export async function getSeniorDashboard(): Promise<unknown> {
  return requireClient().getSeniorDashboard();
}
