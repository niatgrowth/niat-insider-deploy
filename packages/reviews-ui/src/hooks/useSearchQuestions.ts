import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { searchQuestions, getSearchSuggestions } from "@niat/reviews-ui/lib/api";

function parseCursorFromNext(next: string | null): string | undefined {
  if (!next) return undefined;
  try {
    const u = new URL(next);
    return u.searchParams.get("cursor") ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Infinite query for question search. Calls GET /api/questions/search/?q=...&order_by=...&cursor=...
 * Used on /search and /questions?q=...
 */
export function useSearchQuestions(
  query: string,
  orderBy: "-rank" | "-created_at" | "-upvote_count" = "-rank"
) {
  return useInfiniteQuery({
    queryKey: ["questions-search", query, orderBy],
    queryFn: ({ pageParam }) =>
      searchQuestions({
        q: query,
        cursor: pageParam ?? undefined,
        order_by: orderBy,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
    enabled: query.trim().length > 0,
  });
}

/**
 * Suggestions for search typeahead. Calls GET /api/questions/search/suggestions/?q=...
 */
export function useSearchSuggestions(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["questions-search-suggestions", query],
    queryFn: () => getSearchSuggestions(query),
    enabled: enabled && query.trim().length >= 1,
  });
}
