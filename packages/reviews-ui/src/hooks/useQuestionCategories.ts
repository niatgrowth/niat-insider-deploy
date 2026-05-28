import { useQuery } from "@tanstack/react-query";
import { getQuestionCategories } from "@niat/reviews-ui/lib/api";

const CATEGORY_STALE_MS = 30 * 60 * 1000;
const CATEGORY_GC_MS = 60 * 60 * 1000;

/** Fetch question categories from backend (single source of truth). */
export function useQuestionCategories() {
  return useQuery({
    queryKey: ["question-categories"],
    queryFn: getQuestionCategories,
    staleTime: CATEGORY_STALE_MS,
    gcTime: CATEGORY_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export { CATEGORY_STALE_MS };
