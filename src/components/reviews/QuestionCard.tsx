'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ReviewsQuestionCardData {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string | null;
  is_answered: boolean;
  vote_count?: number;
  created_at: string;
  author: {
    id: string;
    username: string;
    is_verified_senior: boolean;
  };
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface QuestionCardProps {
  question: ReviewsQuestionCardData;
  showAnswerPreview?: boolean;
  answerPreview?: string;
  onClick?: () => void;
}

export default function QuestionCard({
  question,
  showAnswerPreview = false,
  answerPreview,
  onClick,
}: QuestionCardProps) {
  const href = `/reviews/questions/${question.slug}`;
  const votes = question.vote_count ?? 0;

  const inner = (
    <>
      <Link
        href={href}
        className="font-semibold text-foreground hover:text-[#991b1b] transition-colors line-clamp-2"
        onClick={onClick}
      >
        {question.title}
      </Link>
      {question.body ? (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{question.body}</p>
      ) : null}
      {showAnswerPreview && answerPreview ? (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 border-l-2 border-[#991b1b]/30 pl-2">
          {answerPreview}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {question.category ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {question.category}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {votes} vote{votes === 1 ? '' : 's'}
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeDate(question.created_at)}
        </span>
        {question.is_answered ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Answered
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Waiting
          </span>
        )}
      </div>
    </>
  );

  return (
    <Card
      className={cn(
        'gap-0 py-4 transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardContent className="px-4">{inner}</CardContent>
    </Card>
  );
}
