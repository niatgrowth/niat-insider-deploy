import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@niat/reviews-ui/lib/api";

export function useNotifications(page = 1, unread?: boolean) {
  return useQuery({
    queryKey: ["notifications", page, unread],
    queryFn: () => fetchNotifications(page, unread),
    staleTime: 30000, // 30 seconds
  });
}

/** Only fetches when enabled is true (e.g. when user is logged in). Set enabled: false when not authenticated to avoid 401s. */
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    enabled,
  });
}

/**
 * Defers unread polling on reviews home so hero/FAQs are not competing with /notifications/unread.
 * Pass `reviewsBasePath` (e.g. "/reviews").
 */
export function useDeferredUnreadCount(
  enabled: boolean,
  reviewsBasePath = "/reviews"
) {
  const pathname = usePathname();
  const base = reviewsBasePath.replace(/\/$/, "") || "/reviews";
  const path = (pathname ?? "").replace(/\/$/, "") || "/";
  const isReviewsHome = path === base;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }
    if (!isReviewsHome) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 3000);
    return () => window.clearTimeout(id);
  }, [enabled, isReviewsHome]);

  return useUnreadCount(enabled && ready);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
