import { useInfiniteQuery } from "@tanstack/react-query";
import { getQuestions } from "@niat/reviews-ui/lib/api";
import type { PaginatedQuestions } from "@niat/reviews-ui/types/question";

export interface UseQuestionsOptions {
  answered?: "true" | "false";
  author?: string | null;
  /** Filter questions answered by this user id (for "My Answers" profile tab) */
  answerAuthor?: string | null;
  /** Filter by category (e.g. "Scholarships & Fee", "Placements & Career") */
  category?: string | null;
  /** Page size for cursor pagination (e.g. 7 desktop, 5 mobile). Backend default 20 if not set. */
  pageSize?: number;
  /** When false, the query is not run (e.g. for "My Answers" when user is not a verified senior) */
  enabled?: boolean;
}

const QUESTIONS_STALE_MS = 5 * 60 * 1000;
const QUESTIONS_GC_MS = 15 * 60 * 1000;

function parseCursorFromNext(next: string | null): string | undefined {
  if (!next) return undefined;
  try {
    const u = new URL(next);
    return u.searchParams.get("cursor") ?? undefined;
  } catch {
    return undefined;
  }
}

async function fetchPage(
  cursor: string | null,
  opts: UseQuestionsOptions
): Promise<PaginatedQuestions> {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (opts.pageSize != null) params.page_size = String(opts.pageSize);
  if (opts.answered) params.answered = opts.answered;
  if (opts.author) params.author = opts.author;
  if (opts.answerAuthor) params.answer_author = opts.answerAuthor;
  if (opts.category) params.category = opts.category;
  return getQuestions(params);
}

export function useQuestions(opts: UseQuestionsOptions = {}) {
  const { enabled = true, ...rest } = opts;
  return useInfiniteQuery({
    queryKey: [
      "questions",
      rest.answered ?? "",
      rest.author ?? "",
      rest.answerAuthor ?? "",
      rest.category ?? "",
      rest.pageSize ?? "",
    ],
    queryFn: ({ pageParam }) => fetchPage(pageParam, rest),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
    enabled,
    staleTime: QUESTIONS_STALE_MS,
    gcTime: QUESTIONS_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export { QUESTIONS_STALE_MS };
