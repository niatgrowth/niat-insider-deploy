import { useQuery } from "@tanstack/react-query";
import { getFAQs } from "@niat/reviews-ui/lib/api";

/** FAQs change rarely — align with server cache (5m) and avoid refetch noise. */
export const FAQ_STALE_MS = 30 * 60 * 1000;
const FAQ_GC_MS = 60 * 60 * 1000;

export type UseFAQsOptions = {
  /** When false, no network request (use with lazy/intersection loading). */
  enabled?: boolean;
  /** Optional upstream limit — forward ?limit= when backend supports it. */
  previewLimit?: number;
};

export function useFAQs(options: UseFAQsOptions = {}) {
  const { enabled = true, previewLimit } = options;
  return useQuery({
    queryKey: ["faqs", previewLimit ?? "all"],
    queryFn: () => getFAQs(previewLimit),
    staleTime: FAQ_STALE_MS,
    gcTime: FAQ_GC_MS,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
