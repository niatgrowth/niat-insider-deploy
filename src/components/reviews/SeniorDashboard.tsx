'use client';

import type { ReviewsUser } from '@/store/reviewsStore';

interface SeniorDashboardProps {
  reviewsUser: ReviewsUser;
  answerCount: number;
}

function formatMemberSince(reviewsUser: ReviewsUser): string {
  const profile = reviewsUser.profile as { created_at?: string } | null;
  const raw = profile?.created_at;
  if (!raw) return '—';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export default function SeniorDashboard({ reviewsUser, answerCount }: SeniorDashboardProps) {
  const verified = reviewsUser.is_verified_senior || reviewsUser.role === 'verified_niat_student';

  const stats = [
    { label: 'Total Answers', value: String(answerCount) },
    { label: 'Verified Badge', value: verified ? 'Yes' : 'No' },
    { label: 'Member since', value: formatMemberSince(reviewsUser) },
    { label: 'Role', value: 'NIAT Senior' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4 text-center shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Your answers help students make better decisions.
      </p>
    </div>
  );
}
