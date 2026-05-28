'use client';

import { useQuery } from '@tanstack/react-query';
import { useReviewsUi } from '@niat/reviews-ui';
import { LoadingSpinner } from '@niat/reviews-ui/components/LoadingSpinner';

export default function ReviewsNotificationsPage() {
  const { api } = useReviewsUi();
  const { data, status, error } = useQuery({
    queryKey: ['notifications', 1],
    queryFn: () => api.fetchNotifications(1),
  });

  if (status === 'pending') {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-center text-niat-text-secondary py-12">
        Could not load notifications. {(error as Error)?.message}
      </p>
    );
  }

  const results = (data as { results?: Array<{ id: string; verb?: string; created_at?: string }> })?.results ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold text-niat-text">Notifications</h1>
      {results.length === 0 ? (
        <p className="text-niat-text-secondary text-sm">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {results.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-niat-border p-3 text-sm bg-[var(--niat-section)]"
            >
              {n.verb ?? 'Update'} · {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
