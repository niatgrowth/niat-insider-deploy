import type { ReviewsQuestionCardData } from '@/components/reviews/QuestionCard';

export interface PaginatedQuestionsResponse {
  results?: unknown[];
  next?: string | null;
}

export function parseNextCursor(next: string | null | undefined): string | null {
  if (!next) return null;
  try {
    const url = new URL(next, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return url.searchParams.get('cursor');
  } catch {
    return next;
  }
}

export function mapQuestionListItem(item: Record<string, unknown>): ReviewsQuestionCardData {
  const author = (item.author as Record<string, unknown>) ?? {};
  return {
    id: String(item.id ?? ''),
    slug: String(item.slug ?? ''),
    title: String(item.title ?? ''),
    body: String(item.body ?? ''),
    category: item.category ? String(item.category) : null,
    is_answered: Boolean(item.is_answered ?? item.has_answer),
    vote_count: Number(item.upvote_count ?? 0),
    created_at: String(item.created_at ?? ''),
    author: {
      id: String(author.id ?? ''),
      username: String(author.username ?? ''),
      is_verified_senior: Boolean(author.is_verified_niat_student ?? author.is_verified_senior),
    },
  };
}

export function mapPaginatedQuestions(data: PaginatedQuestionsResponse): {
  items: ReviewsQuestionCardData[];
  nextCursor: string | null;
} {
  const results = Array.isArray(data.results) ? data.results : [];
  return {
    items: results.map((row) => mapQuestionListItem(row as Record<string, unknown>)),
    nextCursor: parseNextCursor(data.next ?? null),
  };
}

export function getAnswerPreview(item: Record<string, unknown>): string | undefined {
  const answer = item.answer as { body?: string } | null | undefined;
  return answer?.body?.trim() || undefined;
}
