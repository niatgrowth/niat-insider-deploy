'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReviewsUser } from '@/store/reviewsStore';

const ROLE_LABELS: Record<string, string> = {
  intermediate_student: 'Student',
  niat_student: 'NIAT Student',
  verified_niat_student: 'NIAT Senior',
  moderator: 'Moderator',
  admin: 'Admin',
};

function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role.replace(/_/g, ' ');
}

function initials(username: string): string {
  const trimmed = username.trim();
  return (trimmed.charAt(0) || '?').toUpperCase();
}

interface ProfileCardProps {
  reviewsUser: ReviewsUser;
  questionCount?: number;
  answerCount?: number;
  className?: string;
}

export default function ProfileCard({
  reviewsUser,
  questionCount,
  answerCount,
  className,
}: ProfileCardProps) {
  const isSenior = reviewsUser.role === 'verified_niat_student';
  const showVerifiedPill = Boolean(reviewsUser.badge) && reviewsUser.is_verified_senior;

  const statLine =
    isSenior && answerCount != null
      ? `${answerCount} answer${answerCount === 1 ? '' : 's'} given`
      : !isSenior && questionCount != null
        ? `${questionCount} question${questionCount === 1 ? '' : 's'} asked`
        : null;

  return (
    <Card className={cn('w-full max-w-[280px] gap-0 py-4 shadow-sm', className)}>
      <CardContent className="flex flex-col items-center gap-3 px-4 text-center">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#991b1b] text-lg font-semibold text-white"
          aria-hidden
        >
          {initials(reviewsUser.username)}
        </div>
        <div className="min-w-0 space-y-1">
          <p className="truncate text-base font-bold text-foreground">
            {reviewsUser.username}
          </p>
          <p className="text-sm text-muted-foreground">{roleLabel(reviewsUser.role)}</p>
          {showVerifiedPill && (
            <span className="inline-flex items-center rounded-full bg-[#991b1b] px-2 py-0.5 text-xs font-medium text-white">
              ✓ Verified
            </span>
          )}
        </div>
        {statLine && (
          <p className="text-xs text-muted-foreground">{statLine}</p>
        )}
      </CardContent>
    </Card>
  );
}
